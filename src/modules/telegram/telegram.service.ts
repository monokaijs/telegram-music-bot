import {Injectable} from '@nestjs/common';
import {Action, Command, Ctx, InjectBot, Start, Update} from 'nestjs-telegraf';
import {Context, Telegraf} from 'telegraf';
import {YTNodes} from 'youtubei.js';
import {PlayerService} from '../player/player.service';

export interface PlayContext extends Context {
  match: RegExpExecArray;  // Define match as a RegExpExecArray
}

@Injectable()
@Update()
export class TelegramService {

  constructor(
    @InjectBot() private bot: Telegraf,
    private player: PlayerService,
  ) {
    this.bot.telegram.setMyCommands([{
      command: '/play',
      description: 'Play music from sources',
    }]).then(() => {
      console.log('Commands were set');
    });
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('Welcome to Music Player Bot!');
  }

  @Command('play')
  async onPlay(@Ctx() ctx: Context) {
    this.playMusic();
    await ctx.reply('Playing music!');
  }

  @Command('pause')
  async onPause(@Ctx() ctx: Context) {
    this.pauseMusic();
    await ctx.reply('Music paused.');
  }

  @Command('stop')
  async onStop(@Ctx() ctx: Context) {
    this.player.stop();
  }

  @Command('next')
  async onNext(@Ctx() ctx: Context) {
    this.nextTrack();
    await ctx.reply('Playing next track.');
  }

  @Command('search')
  async onSearch(@Ctx() ctx: Context) {
    const message = ctx.text;
    const query = message?.split(' ').slice(1).join(' ');

    if (!query) {
      await ctx.reply('Please provide a search query.');
      return;
    }

    const {results} = await this.player.search(query);

    if (results.length === 0) {
      await ctx.reply('No tracks found.');
    } else {
      const buttons = results.filter((item) => item.type === 'Video').map((result, index) => {
        const video = result.as(YTNodes.Video);
        return {
          text: video.title.text,
          callback_data: `play_${video.id}`,
        };
      }).filter((_, index) => index < 5);

      await ctx.reply('Select a track to play:', {
        reply_markup: {
          inline_keyboard: buttons.map(item => [item]),
        },
      });

      // Store results in the session for later use
      // ctx.session.youtubeResults = results;
    }
  }

  @Action(/play_(.*)+/)
  async onPlayAction(@Ctx() ctx: PlayContext) {
    const action = ctx.match[0];
    const videoId = action.split('_')[1];
    const videoInfo = await this.player.getVideoInfo(videoId);
    const stream = await this.player.getVideoDownloadUrl(videoId);
    await ctx.editMessageText('Loading...');
    await ctx.editMessageText(`[Now Playing] ${videoInfo.basic_info.title}\n` +
      `---------------\n` +
      `Queue: \n` +
      `1. Some song\n` +
      `2. Some other song`, {
      reply_markup: {
        inline_keyboard: [
          [{
            text: '▶️ Pause',
            callback_data: 'pause',
          }, {
            text: '⏹️ Stop',
            callback_data: 'stop',
          }, {
            text: '⏭️ Skip',
            callback_data: 'up_next',
          }],
          [{
            text: '🗒️ Queue',
            callback_data: 'view_queue',
          }],
          [{
            text: '🔊 Volume Up',
            callback_data: 'volume_up',
          }, {
            text: '🔉 Volume Down',
            callback_data: 'volume_down',
          }, {
            text: '🔇 Mute',
            callback_data: 'mute',
          }],
        ],
      },
    })
    this.player.enqueue(videoInfo).then(() => {
    });
    await this.player.renderMessage(ctx);
  }

  @Command('volume')
  async changeVolume(@Ctx() ctx: Context) {
    const volume = parseInt(ctx.text.split(' ')[1]);
    this.player.setVolume(volume / 100);
    await ctx.deleteMessage();
    const message = await ctx.reply('Volume was set to ' + volume + '%');
    setTimeout(() => {
      ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);
    }, 5000);
  }

  private playMusic() {
    // Implement your logic to play music
  }

  private pauseMusic() {
    // Implement your logic to pause music
  }

  private stopMusic() {
    // Implement your logic to stop music
  }

  private nextTrack() {
    // Implement your logic to skip to the next track
  }
}
