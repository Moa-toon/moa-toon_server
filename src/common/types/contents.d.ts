export enum UpdateDayCode {
  monday = 'mon',
  tuesday = 'tue',
  wednesday = 'wed',
  thursday = 'thu',
  friday = 'fri',
  saturday = 'sat',
  sunday = 'sun',
  daily = 'daily',
  finished = 'finished',
}

export enum PlatformType {
  naver = 'naver',
  kakao = 'kakao',
  kakaoPage = 'kakaoPage',
}

export type WebtoonSimpleInfo = {
  id: string;
  title: string;
  authors: Array<string>;
  url: string;
  thumbnailPath: string;
  platform: 'naver' | 'kakao' | 'kakaopage';
  updateDays: Array<string>;
  additional: {
    isNew: boolean;
    isAdult: boolean;
    isPaused: boolean;
    isUpdated: boolean;
  };
};

export type WebtoonEpisodeInfo = {
  name: string;
  url: string;
  thumbnailPath: string;
  createDate: string;
  isFree?: boolean;
};

export type WebtoonAdditionalInfo = {
  url: string;
  summary: string;
  description: string;
  genres: Array<string>;
  episodes: Array<WebtoonEpisodeInfo>;
};

export type Webtoon = WebtoonSimpleInfo & WebtoonAdditionalInfo;
