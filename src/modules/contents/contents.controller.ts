import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { setRes } from 'src/common/utils/setRes';
import { ContentsService } from './contents.service';
import { GetContentReqParamDto, GetContentsReqQueryDto } from './dto/request';
import { ContentsResponse } from './dto/response';

@ApiTags('콘텐츠 API')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('')
  @ApiOperation({ summary: '컨텐츠 목록 조회 API', description: '' })
  @ApiOkResponse({
    description: '성공',
    type: ContentsResponse,
  })
  @ApiNotFoundResponse({
    description: '컨텐츠 데이터가 존재하지 않음.',
  })
  async getContents(@Query() query: GetContentsReqQueryDto) {
    const contents = await this.contentsService.getContents(query);
    if (contents.items.length === 0) return setRes(404);
    if (contents === null) return setRes(500);
    return setRes(200, contents);
  }

  @Get('/:contentId')
  @ApiOperation({ summary: '컨텐츠 상세정보 조회 API', description: '' })
  async getContentById(@Param() param: GetContentReqParamDto) {
    try {
      const content = await this.contentsService.getContentDetailById(
        param.contentId,
      );
      if (content === null) return setRes(404);
      return setRes(200, content);
    } catch (err) {
      console.error(err);
      return setRes(500);
    }
  }
}
