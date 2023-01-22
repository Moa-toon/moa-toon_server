import { Module } from '@nestjs/common';
import { ContentsService } from 'src/modules/contents/contents.service';
import { ScrapeContentService } from 'src/scrape-content/scrape-content.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [ScrapeContentService, ContentsService],
})
export class AdminModule {}
