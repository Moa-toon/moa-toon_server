import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiNotFoundResponse({
    description: '콘텐츠 데이터가 존재하지 않음.',
  })
  @ApiOperation({ summary: '콘텐츠 목록 조회 API', description: '' })
  async getContents(@Query() query: GetContentsReqQueryDto) {
    const contents = await this.contentsService.getContents(query);
    if (contents.items.length === 0)
      throw new NotFoundException('리소스가 존재하지 않습니다.');
    return contents;
  }
}
