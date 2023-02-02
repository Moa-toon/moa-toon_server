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
  id: string;
  type: number;
  title: string;
  authors: Array<string>;
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
  ageLimit: number;
  urlOfMobile: string;
  summary: string;
  description: string;
  genres: Array<string>;
  episodes: Array<WebtoonEpisodeInfo>;
};

export type GenreInfo = {
  main: string;
  sub: Set<string>;
};

export type Webtoon = WebtoonSimpleInfo & WebtoonAdditionalInfo;
