import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsService } from 'src/modules/contents/contents.service';
import { Author } from 'src/modules/contents/entities/Author';
import { Content } from 'src/modules/contents/entities/Content';
import { ContentAuthor } from 'src/modules/contents/entities/ContentAuthor';
import { ContentGenre } from 'src/modules/contents/entities/ContentGenre';
import { ContentUpdateDay } from 'src/modules/contents/entities/ContentUpdateDay';
import { Genre } from 'src/modules/contents/entities/Genre';
import { Platform } from 'src/modules/contents/entities/Platform';
import { UpdateDay } from 'src/modules/contents/entities/UpdateDay';
import { ScrapeContentService } from 'src/modules/scrape-content/scrape-content.service';
import { Episode } from '../contents/entities/Episode';
import { AdminController } from './admin.controller';

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
  controllers: [AdminController],
  providers: [ScrapeContentService, ContentsService],
})
export class AdminModule {}
