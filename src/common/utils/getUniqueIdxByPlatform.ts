import { Platforms } from '../types/contents';

export const getUniqueIdxByPlatform = (name: string): string => {
  switch (name) {
    case Platforms.naver:
      return '10000';
    case Platforms.kakao:
      return '20000';
    case Platforms.kakaoPage:
      return '30000';
    default:
      return null;
  }
};
