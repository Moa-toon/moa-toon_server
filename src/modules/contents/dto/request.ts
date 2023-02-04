import { ApiProperty } from '@nestjs/swagger';
import {
  Contents,
  ContentType,
  Platforms,
  PlatformType,
  UpdateDayCode,
  UpdateDays,
} from 'src/common/types/contents';
import { PaginationOptions } from 'src/common/utils/pagination/pagination.options';
import {
  IsNumberString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetContentReqParamDto {
  @ApiProperty({
    type: String,
    description: '컨텐츠 UUID',
    example: '10000758037',
    required: true,
  })
  @IsNumberString()
  @IsNotEmpty()
  readonly contentId: string;
}

export const SortOptions = {
  title: 'title',
  cnt_review: 'cnt_review',
  avg_rating: 'avg_rating',
} as const;
export type SortOptionType = typeof SortOptions[keyof typeof SortOptions];

export class SearchContentsReqQueryDto {
  @ApiProperty({
    type: String,
    description: '장르(두 개 이상은 ,로 구분)',
    example: '드라마,로맨스',
    required: false,
  })
  @IsOptional()
  @IsString()
  genres?: string;
  @ApiProperty({
    type: String,
    description: '태그(두 개 이상은 ,로 구분)',
    example: '가족,감동',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
  @ApiProperty({
    type: String,
    description: '콘텐츠 제공 플랫폼',
    enum: Platforms,
    required: false,
  })
  @IsOptional()
  @IsEnum(Platforms)
  platform?: PlatformType;
  @ApiProperty({
    type: String,
    description: '검색어',
    example: '갓오브',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;
  @ApiProperty({
    type: String,
    description: '컨텐츠 정렬 기준',
    enum: SortOptions,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOptions)
  sortBy?: SortOptionType;
}

export class GetContentsReqQueryDto implements PaginationOptions {
  @ApiProperty({
    type: String,
    description: '콘텐츠 타입',
    enum: Contents,
    required: false,
  })
  @IsEnum(Contents)
  @IsOptional()
  readonly type: ContentType;

  @ApiProperty({
    type: String,
    description: '콘텐츠 제공 플랫폼',
    enum: Platforms,
    required: false,
  })
  @IsEnum(Platforms)
  @IsOptional()
  readonly platform: PlatformType;

  @ApiProperty({
    type: String,
    description: '콘텐츠 업데이트 요일',
    enum: UpdateDays,
    required: false,
  })
  @IsEnum(UpdateDays)
  @IsOptional()
  readonly updateDay: UpdateDayCode;

  @ApiProperty({
    type: Number,
    description: '페이지',
    example: 1,
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  readonly page: number;

  @ApiProperty({
    type: Number,
    description: '불러올갯수',
    example: 10,
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  readonly take: number;

  @ApiProperty({
    type: String,
    description: '컨텐츠 정렬 기준',
    enum: SortOptions,
    required: false,
  })
  @IsEnum(SortOptions)
  @IsOptional()
  sortBy?: SortOptionType;
}
