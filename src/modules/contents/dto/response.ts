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

export abstract class Author {
  @ApiProperty({
    type: Number,
    description: '작가 구분',
    examples: ['공통', '글', '그림', '원작', '발행처'],
  })
  type: string;

  @ApiProperty({
    type: String,
    description: '이름',
  })
  name: string;
}

export abstract class EpisodeData {
  @ApiProperty({
    type: Number,
    description: '콘텐츠 총 개수',
    example: 10,
  })
  totalCount: number;

  @ApiProperty({
    type: Array<Episode>,
  })
  items: Array<Episode>;
}

export abstract class Episode {
  @ApiProperty({
    type: Number,
    description: '회차 번호',
  })
  order: number;

  @ApiProperty({
    type: String,
    description: '제목',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: '페이지 url',
  })
  pageUrl: string;

  @ApiProperty({
    type: String,
    description: '썸네일 이미지 url',
  })
  thumbnailUrl: string;

  @ApiProperty({
    type: Boolean,
    description: '회차 무료 여부',
  })
  isFree: boolean;

  @ApiProperty({
    type: Date,
    description: '연재일',
  })
  createdAt: Date;
}

export abstract class Genre {
  @ApiProperty({
    type: String,
    description: '메인 장르',
  })
  main: string;
  @ApiProperty({
    type: Array<String>,
    description: '서브 장르',
  })
  sub: Array<string>;
}

export abstract class ContentDetail {
  @ApiProperty({
    type: Number,
    description: '인덱스',
  })
  idx: number;

  @ApiProperty({
    type: Genre,
  })
  genre: Genre;

  @ApiProperty({
    type: String,
    description: '제목',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: '줄거리',
  })
  description: string;

  @ApiProperty({
    type: String,
    description: '나이 제한',
    examples: ['전체 이용가', '19세 이상'],
  })
  ageLimitKor: string;

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

  @ApiProperty({
    type: Array<Author>,
    description: '작가 정보',
  })
  authors: Array<Author>;

  @ApiProperty({
    type: EpisodeData,
  })
  episodes: EpisodeData;
}

export abstract class ContentResponse {
  @ApiProperty({
    type: Number,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    type: ContentDetail,
  })
  data: ContentDetail;

  @ApiProperty({
    type: String,
  })
  error: string;
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
