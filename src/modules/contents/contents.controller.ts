import { Controller, Get, Query } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { GetContentsReqQueryDto } from './dto/request';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('/')
  async getContents(@Query() query: GetContentsReqQueryDto) {
    const contents = await this.contentsService.getContents(query);
    return contents;
  }
}
