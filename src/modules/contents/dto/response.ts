import { ApiProperty } from '@nestjs/swagger';

abstract class Content {
  @ApiProperty({
    type: Number,
    description: '인덱스',
  })
  idx: number;

  @ApiProperty({
    type: String,
    description: '제목',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: '줄거리 요약',
  })
  summary: string;

  @ApiProperty({
    type: Number,
    description: '나이 제한',
    examples: ['0 => 전체 이용가', '19 => 19세 이상'],
  })
  ageLimit: number;

  @ApiProperty({
    type: String,
    description: '홈페이지 url',
  })
  pageUrl: string;

  @ApiProperty({
    type: String,
    description: '썸네일 url',
  })
  thumbnailUrl: string;

  @ApiProperty({
    type: Boolean,
    description: '신작 여부',
  })
  isNew: boolean;

  @ApiProperty({
    type: Boolean,
    description: '업데이트 여부',
  })
  isUpdated: boolean;

  @ApiProperty({
    type: Boolean,
    description: '19세 이상 여부',
  })
  isAdult: boolean;
}

export abstract class PaginationMetaData {
  @ApiProperty({
    type: Number,
    description: '콘텐츠 총 개수',
    example: 10,
  })
  totalCount: number;

  @ApiProperty({
    type: Number,
    description: '페이지 수',
    example: 1,
  })
  pageCount: number;
}

export abstract class ContentPaginationData {
  items: Array<Content>;
  meta: PaginationMetaData;
}

export abstract class ContentsResponse {
  @ApiProperty({
    type: Number,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    type: ContentPaginationData,
  })
  data: ContentPaginationData;

  @ApiProperty({
    type: String,
  })
  error: string;
}
