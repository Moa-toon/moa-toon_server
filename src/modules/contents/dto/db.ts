import { PlatformType, UpdateDayCode } from 'src/common/types/contents';
import { SortOptionType } from './request';

export type FindContentsOption = {
  type?: number;
  platform?: PlatformType;
  updateDay?: UpdateDayCode;
  page?: number;
  take?: number;
  sortBy?: SortOptionType;
};
