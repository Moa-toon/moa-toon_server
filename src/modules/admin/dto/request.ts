import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import {
  Contents,
  ContentType,
  OriginalType,
  OriginalTypeCode,
  Platforms,
  PlatformType,
  UpdateDayCode,
  UpdateDays,
} from 'src/common/types/contents';

export class ScrapeContentsReqQueryDto {
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
    description: '(카카오 한정)콘텐츠 원작 타입',
    enum: OriginalType,
    required: false,
  })
  @IsEnum(OriginalType)
  @IsOptional()
  readonly originalType: OriginalTypeCode;

  @ApiProperty({
    type: String,
    description: '콘텐츠 업데이트 요일',
    enum: UpdateDays,
    required: true,
  })
  @IsEnum(UpdateDays)
  @IsNotEmpty()
  readonly updateDay: UpdateDayCode;
}

export type SortOption = {
  offset: number;
  limit: number;
};
