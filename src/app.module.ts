import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { getTypeOrmModule } from './common/utils/getTypeOrmModule';
import { ContentsModule } from './modules/contents/contents.module';
import { AdminModule } from './modules/admin/admin.module';
import { ScrapeContentModule } from './modules/scrape-content/scrape-content.module';
import { ContentsController } from './modules/contents/contents.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
      }),
    }),
    getTypeOrmModule(),
    ContentsModule,
    AdminModule,
    ScrapeContentModule,
  ],
  controllers: [AppController, ContentsController],
  providers: [AppService],
})
export class AppModule {}
