import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { Author } from './entities/Author';
import { Content } from './entities/Content';
import { ContentAuthor } from './entities/ContentAuthor';
import { ContentGenre } from './entities/ContentGenre';
import { ContentUpdateDay } from './entities/ContentUpdateDay';
import { Episode } from './entities/Episode';
import { Genre } from './entities/Genre';
import { Platform } from './entities/Platform';
import { UpdateDay } from './entities/UpdateDay';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Platform,
      UpdateDay,
      Genre,
      Author,
      Content,
      ContentAuthor,
      ContentGenre,
      ContentUpdateDay,
      Episode,
    ]),
  ],
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
