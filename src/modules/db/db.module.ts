import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {DbService} from "./db.service";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get("db.uri"),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    // MongooseModule.forFeature([{
    //   name: User.name,
    //   schema: UserSchema
    // }])
  ],
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {
}
