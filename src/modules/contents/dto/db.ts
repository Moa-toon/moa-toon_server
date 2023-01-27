import { PlatformType, UpdateDayCode } from 'src/common/types/contents';

export type FindContentsOption = {
  type: number;
  platform: PlatformType;
  updateDay: UpdateDayCode;
  page: number;
  take: number;
};
