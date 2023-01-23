import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsService } from './contents.service';
import { Author } from './entities/Author';
import { Genre } from './entities/Genre';
import { Platform } from './entities/Platform';
import { UpdateDay } from './entities/UpdateDay';

@Module({
  imports: [TypeOrmModule.forFeature([Platform, UpdateDay, Genre, Author])],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
