import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentsService } from 'src/modules/contents/contents.service';
import { Author } from 'src/modules/contents/entities/Author';
import { Genre } from 'src/modules/contents/entities/Genre';
import { Platform } from 'src/modules/contents/entities/Platform';
import { UpdateDay } from 'src/modules/contents/entities/UpdateDay';
import { ScrapeContentService } from 'src/scrape-content/scrape-content.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Platform, UpdateDay, Genre, Author])],
  controllers: [AdminController],
  providers: [ScrapeContentService, ContentsService],
})
export class AdminModule {}
