import {Module} from '@nestjs/common';
import {AppConfigModule} from './modules/app-config/app-config.module';
import {DbModule} from './modules/db/db.module';
import {TelegramModule} from './modules/telegram/telegram.module';

@Module({
  imports: [
    AppConfigModule,
    DbModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
