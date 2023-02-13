import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from '../db/typeorm-ex.module';
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
import { AuthorRepository } from './repositories/author.repository';
import { ContentAuthorRepository } from './repositories/content-author.repository';
import { ContentGenreRepository } from './repositories/content-genre.repository';
import { ContentUpdateDayRepository } from './repositories/content-update-day.repository';
import { ContentRepository } from './repositories/contents.repository';
import { EpisodeRepository } from './repositories/episode.repository';
import { GenreRepository } from './repositories/genre.repository';
import { PlatformRepository } from './repositories/platform.repository';
import { UpdateDayRepository } from './repositories/update-day.repository';

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
    ]),
  ],
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
