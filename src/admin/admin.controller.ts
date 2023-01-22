import { Controller, Get, Query } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { ScrapeContentService } from 'src/scrape-content/scrape-content.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly scrapeContentService: ScrapeContentService) {}
  @Get('/contents')
  async getContentsByPlatform(
    @Query('platform') platform: string,
    @Query('updateDay') updateDay: string,
  ) {
    try {
      const contents = await this.scrapeContentService.getContentsByPlatform(
        platform,
        updateDay,
      );
      writeFileSync('naver.webtoon.json', JSON.stringify(contents));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
