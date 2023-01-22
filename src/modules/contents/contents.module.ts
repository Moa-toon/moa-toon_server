import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsService } from './contents.service';
import { Platform } from './entities/Platform';
import { UpdateDay } from './entities/UpdateDay';

@Module({
  imports: [TypeOrmModule.forFeature([Platform, UpdateDay])],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
