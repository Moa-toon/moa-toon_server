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

export type Webtoon = {
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
  summary: string;
  description: string;
  genres: Array<string>;
};
