import { Module } from '@nestjs/common';
import { ScrapeContentService } from './scrape-content.service';

@Module({
  providers: [ScrapeContentService],
  exports: [ScrapeContentService],
})
export class ScrapeContentModule {}
