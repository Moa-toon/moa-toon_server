import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScrapeContentService } from './scrape-content.service';

@Module({
  imports: [HttpModule],
  providers: [ScrapeContentService],
  exports: [ScrapeContentService],
})
export class ScrapeContentModule {}
