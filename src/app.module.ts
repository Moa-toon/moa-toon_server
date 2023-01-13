import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmModule } from './common/utils/getTypeOrmModule';
import { ContentsModule } from './modules/contents/contents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `envs/.env.${process.env.NODE_ENV}`,
    }),
    getTypeOrmModule(),
    ContentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
