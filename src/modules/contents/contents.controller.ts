import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentsService } from './contents.service';
import { GetContentsReqQueryDto } from './dto/request';
import { ContentsResponse } from './dto/response';

@ApiTags('콘텐츠 API')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('')
  @ApiOkResponse({
    description: '성공',
    type: ContentsResponse,
  })
  @ApiOperation({ summary: '콘텐츠 목록 조회 API', description: '' })
  async getContents(@Query() query: GetContentsReqQueryDto) {
    const contents = await this.contentsService.getContents(query);
    return contents;
  }
}
