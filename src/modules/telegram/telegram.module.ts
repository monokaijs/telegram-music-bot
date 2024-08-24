import {Module} from '@nestjs/common';
import {TelegrafModule} from 'nestjs-telegraf';
import {ConfigService} from '@nestjs/config';
import {TelegramService} from './telegram.service';
import {PlayerModule} from '../player/player.module';

@Module({
  imports: [
    PlayerModule,
    TelegrafModule.forRootAsync({
      useFactory(config: ConfigService) {
        return {
          token: config.get('telegram.token'),
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {
}
