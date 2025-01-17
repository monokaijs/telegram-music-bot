import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  await app.listen(config.get('port'));

  return app.getUrl();
}
bootstrap().then(url => {
  console.log(`Now live at: ${url}`);
});
