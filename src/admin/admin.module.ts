import { Module } from '@nestjs/common';
import { ScrapeContentService } from 'src/scrape-content/scrape-content.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [ScrapeContentService],
})
export class AdminModule {}
