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
import { IsNumberString, IsNotEmpty, IsEnum } from 'class-validator';

export class GetContentsReqQueryDto implements PaginationOptions {
  @ApiProperty({
    type: String,
    description: '콘텐츠 타입',
    enum: Contents,
    required: true,
  })
  @IsEnum(Contents)
  @IsNotEmpty()
  readonly type: ContentType;

  @ApiProperty({
    type: String,
    description: '콘텐츠 제공 플랫폼',
    enum: Platforms,
    required: true,
  })
  @IsEnum(Platforms)
  @IsNotEmpty()
  readonly platform: PlatformType;

  @ApiProperty({
    type: String,
    description: '콘텐츠 업데이트 요일',
    enum: UpdateDays,
    required: true,
  })
  @IsEnum(UpdateDays)
  @IsNotEmpty()
  readonly updateDay: UpdateDayCode;

  @ApiProperty({
    type: Number,
    description: '페이지',
    example: 1,
    required: true,
  })
  @IsNumberString()
  @IsNotEmpty()
  readonly page: number;

  @ApiProperty({
    type: Number,
    description: '불러올갯수',
    example: 10,
    required: true,
  })
  @IsNumberString()
  @IsNotEmpty()
  readonly take: number;
}

export class GetContentReqParamDto {
  @ApiProperty({
    type: Number,
    description: '컨텐츠 인덱스 번호',
    example: 1,
    required: true,
  })
  @IsNumberString()
  @IsNotEmpty()
  readonly contentId: number;
}
