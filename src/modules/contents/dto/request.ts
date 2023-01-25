import { ApiProperty } from '@nestjs/swagger';
import {
  ContentType,
  PlatformType,
  UpdateDayCode,
} from 'src/common/types/contents';
import { PaginationOptions } from 'src/common/utils/pagination/pagination.options';
import { IsNumberString, IsNotEmpty, IsEnum } from 'class-validator';

export class GetContentsReqQueryDto implements PaginationOptions {
  @ApiProperty({
    type: String,
    description: '콘텐츠 타입',
    examples: ContentType,
    required: true,
  })
  @IsEnum(ContentType)
  @IsNotEmpty()
  readonly type: ContentType;

  @ApiProperty({
    type: String,
    description: '콘텐츠 제공 플랫폼',
    examples: PlatformType,
    required: true,
  })
  @IsEnum(PlatformType)
  @IsNotEmpty()
  readonly platform: PlatformType;

  @ApiProperty({
    type: String,
    description: '콘텐츠 업데이트 요일',
    examples: UpdateDayCode,
    required: true,
  })
  @IsEnum(UpdateDayCode)
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
