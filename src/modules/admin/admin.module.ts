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
import { AuthorRepository } from '../contents/repositories/author.repository';
import { ContentAuthorRepository } from '../contents/repositories/content-author.repository';
import { ContentGenreRepository } from '../contents/repositories/content-genre.repository';
import { ContentTagRepoitory } from '../contents/repositories/content-tag.repository';
import { ContentUpdateDayRepository } from '../contents/repositories/content-update-day.repository';
import { ContentRepository } from '../contents/repositories/contents.repository';
import { EpisodeRepository } from '../contents/repositories/episode.repository';
import { GenreRepository } from '../contents/repositories/genre.repository';
import { PlatformRepository } from '../contents/repositories/platform.repository';
import { TagRepository } from '../contents/repositories/tag.repository';
import { UpdateDayRepository } from '../contents/repositories/update-day.repository';
import { TypeOrmExModule } from '../db/typeorm-ex.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      PlatformRepository,
      ContentRepository,
      UpdateDayRepository,
      GenreRepository,
      AuthorRepository,
      ContentAuthorRepository,
      ContentGenreRepository,
      ContentUpdateDayRepository,
      EpisodeRepository,
      TagRepository,
      ContentTagRepoitory,
    ]),
  ],
  controllers: [AdminController],
  providers: [ScrapeContentService, ContentsService],
})
export class AdminModule {}
