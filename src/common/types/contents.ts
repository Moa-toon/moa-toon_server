import { WebtoonAuthor } from './kakao-content';

export type UpdateDayKor =
  | '월'
  | '화'
  | '수'
  | '목'
  | '금'
  | '토'
  | '일'
  | '데일리'
  | '완결';
export const UpdateDays = {
  monday: 'mon',
  tuesday: 'tue',
  wednesday: 'wed',
  thursday: 'thu',
  friday: 'fri',
  saturday: 'sat',
  sunday: 'sun',
  daily: 'daily',
  finished: 'finished',
} as const;
export type UpdateDayCode = typeof UpdateDays[keyof typeof UpdateDays];

export const UpdateWeekDaysKor = {
  월: UpdateDays.monday,
  화: UpdateDays.tuesday,
  수: UpdateDays.wednesday,
  목: UpdateDays.thursday,
  금: UpdateDays.friday,
  토: UpdateDays.saturday,
  일: UpdateDays.sunday,
} as const;
export type UpdateWeekDaysKorKey = keyof typeof UpdateWeekDaysKor;

export const Platforms = {
  naver: 'naver',
  kakao: 'kakao',
  kakaoPage: 'kakaoPage',
} as const;
export type PlatformType = typeof Platforms[keyof typeof Platforms];

export const Contents = {
  webtoon: 'webtoon',
  webNovel: 'webNovel',
} as const;
export type ContentType = typeof Contents[keyof typeof Contents];

export type WebtoonSimpleInfo = {
  id: number;
  type: number;
  ageLimit?: number;
  title: string;
  authors: Array<WebtoonAuthor>; // 이 부분 변경 필요 { name: string, type: string }
  summary?: string;
  description?: string;
  tags?: Array<string>;
  urlOfPc: string;
  urlOfMobile: string;
  thumbnailPath: string;
  platform: PlatformType;
  updateDays: Array<UpdateDayCode>;
  additional: {
    isNew: boolean;
    isAdult: boolean;
    isPaused: boolean;
    isUpdated: boolean;
  };
  startedAt?: string;
};

export type WebtoonEpisodeInfo = {
  order?: number;
  title: string;
  urlOfPc: string;
  urlOfMobile: string;
  thumbnailUrl: string;
  createDate: string;
  isFree: boolean;
};

export type WebtoonAdditionalInfo = {
  contentId: number;
  ageLimit?: number;
  summary?: string;
  description?: string;
  genres: Array<string>;
  episodes: Array<WebtoonEpisodeInfo>;
};

export type GenreInfo = {
  main: string;
  sub: Set<string>;
};

export type Webtoon = WebtoonSimpleInfo & WebtoonAdditionalInfo;
