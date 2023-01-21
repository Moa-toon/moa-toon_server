import { Module } from '@nestjs/common';
import { ScrapeContentService } from './scrape-content.service';

@Module({
  providers: [ScrapeContentService]
})
export class ScrapeContentModule {}
