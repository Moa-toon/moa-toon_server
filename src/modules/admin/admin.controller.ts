import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: '컨텐츠 스크래핑 후 DB 업데이트 API',
    description: '웹툰, 웹소설 컨텐츠를 스크래핑한 후 DB에 업데이트한다.',
  })
  @ApiNoContentResponse({ description: '성공했지만 제공할 컨텐츠가 없음' })
  async getContentsByPlatform(@Query() query: ScrapeContentsReqQueryDto) {
    try {
      const contents = await this.scrapeContentService.getContentsByPlatform(
        query.platform,
        query.updateDay,
        query.originalType,
      );

      // Array<{ main: string; sub: Set<string> }>
      const genres = this.contentsService.getGenres(contents);
      // Set<string>
      const authors = this.contentsService.getAuthors(contents);
      // Set<string>
      const tags = this.contentsService.getTags(contents);
      console.log('genre 저장');
      // genre 저장
      await this.contentsService.saveGenres(genres);
      console.log('author 저장');
      // authors 저장
      await this.contentsService.saveAuthors(authors);
      console.log('content 저장');
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
