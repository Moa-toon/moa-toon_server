import { Controller, Get, Query } from '@nestjs/common';
import { ScrapeContentService } from 'src/scrape-content/scrape-content.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly scrapeContentService: ScrapeContentService) {}
  @Get('/contents')
  async getContentsByPlatform(@Query('platform') platform: string) {
    return this.scrapeContentService.getContentsByPlatform(platform);
  }
}
