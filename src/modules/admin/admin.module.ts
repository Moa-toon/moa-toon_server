import { Module } from '@nestjs/common';
import { ContentsModule } from '../contents/contents.module';
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
import { ScrapeContentModule } from '../scrape-content/scrape-content.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    ScrapeContentModule,
    ContentsModule,
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
  providers: [],
})
export class AdminModule {}
