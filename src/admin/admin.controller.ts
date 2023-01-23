import { Controller, Get, Post, Query } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { PlatformType, UpdateDayCode } from 'src/common/types/contents';
import { ContentsService } from 'src/modules/contents/contents.service';
import { ScrapeContentService } from 'src/scrape-content/scrape-content.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly scrapeContentService: ScrapeContentService,
    private readonly contentsService: ContentsService,
  ) {}

  @Get('/contents')
  async getContentsByPlatform(
    @Query('platform') platform: PlatformType,
    @Query('updateDay') updateDay: UpdateDayCode,
  ) {
    try {
      const contents = await this.scrapeContentService.getContentsByPlatform(
        platform,
        updateDay,
      );
      // Array<{ main: string; sub: Set<string> }>
      const genres = this.contentsService.getGenres(contents);
      // Set<string>
      const authors = this.contentsService.getAuthors(contents);
      console.log(genres);
      console.log(authors);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  @Post('/contentsTbl')
  async initContentsTbl() {
    try {
      const result = await this.contentsService.initContentsTbl();
      console.log(result);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
