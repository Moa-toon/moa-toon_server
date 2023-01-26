import { Controller, Get, Post, Query } from '@nestjs/common';
import { setRes } from 'src/common/utils/setRes';
import { ContentsService } from 'src/modules/contents/contents.service';
import { ScrapeContentService } from 'src/modules/scrape-content/scrape-content.service';
import { ScrapeContentsReqQueryDto } from './dto/request';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly scrapeContentService: ScrapeContentService,
    private readonly contentsService: ContentsService,
  ) {}

  @Get('/contents')
  async getContentsByPlatform(@Query() query: ScrapeContentsReqQueryDto) {
    try {
      const contents = await this.scrapeContentService.getContentsByPlatform(
        query.platform,
        query.updateDay,
      );
      // Array<{ main: string; sub: Set<string> }>
      const genres = this.contentsService.getGenres(contents);
      // Set<string>
      const authors = this.contentsService.getAuthors(contents);
      // genre 저장
      await this.contentsService.saveGenres(genres);
      // authors 저장
      await this.contentsService.saveAuthors(authors);
      // contents 저장
      await this.contentsService.saveContents(contents);
      return setRes(204);
    } catch (err) {
      console.error(err);
      return setRes(500);
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
