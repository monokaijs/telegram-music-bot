import {Injectable} from '@nestjs/common';
import Speaker from 'speaker';
import Innertube from 'youtubei.js';
import Volume from 'pcm-volume';
import {PlaySession} from './play-session';
import {VideoInfo} from 'youtubei.js/dist/src/parser/youtube';
import {PlayerStatus} from './player.dto';
import {PlayContext} from '../telegram/telegram.service';
import {Readable} from 'stream';


@Injectable()
export class PlayerService {
  private innertube: Innertube;
  private speaker = new Speaker();
  private volume = new Volume();
  private queue: VideoInfo[] = [];
  private status: PlayerStatus = PlayerStatus.Idle;
  private playingIndex: number = 0;

  constructor() {
    Innertube.create().then(client => {
      this.innertube = client;
    })
  }

  search(query: string) {
    return this.innertube.search(query, {
      type: 'video',
    });
  }

  stop() {
    return this.speaker.close(true);
  }

  play(url: string) {
    const session = new PlaySession(url, this.speaker, this.volume);
    session.on('play', () => {
      this.status = PlayerStatus.Playing;
    });
    session.on('error', () => {
      this.status = PlayerStatus.Idle;
    })
    session.play().then(() => {});
  }

  async enqueue(info: VideoInfo) {
    this.queue.push(info);
    if (this.queue.length === 1) {
      const url = await this.getVideoDownloadUrl(info.basic_info.id);
      this.play(url);
    }
  }

  setVolume(volume: number) {
    this.volume.setVolume(volume);
  }

  renderMessage(ctx: PlayContext) {
    const videoInfo = this.queue[this.playingIndex];
    const statusText = this.status === PlayerStatus.Playing ? 'Playing' : 'Not Playing';
    return ctx.editMessageText(`[${statusText}] ${videoInfo.basic_info.title}\n` +
      `---------------\n` +
      `Queue: \n` +
      this.queue.map((video, index) => `${index + 1}. ${video.basic_info.title}`).join('\n') +
      ``, {
      reply_markup: {
        inline_keyboard: [
          [{
            text: this.status === PlayerStatus.Playing ? '⏸️ Pause' : '▶️ Play',
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
    });
  }

  async getVideoInfo(videoId: string) {
    return this.innertube.getBasicInfo(videoId, "ANDROID");
  }

  download(videoId: string) {
    return this.innertube.download(videoId, {
      type: 'audio',
      quality: 'best',
      format: 'mp3',
      client: 'ANDROID',
    });
  }

  async getVideoDownloadUrl(videoId: string) {
    const info = await this.getVideoInfo(videoId);
    return info.streaming_data?.formats[0].decipher(this.innertube.session.player);
  }
}
