export const KAKAO_WEBTOON_API_BASE_URL =
  'https://gateway-kw.kakao.com/section/v4';
export const KAKAO_WEBTOON_BASE_URL = 'https://webtoon.kakao.com/content';
export const KAKAO_WEBTOON_DETAIL_API_BASE_URL =
  'https://gateway-kw.kakao.com/decorator/v2/decorator/contents';
export const KAKAO_WEBTOON_EPISODE_API_BASE_URL =
  'https://gateway-kw.kakao.com/episode/v2/views/content-home/contents';
export const KAKAO_WEBTOON_EPISODE_BASE_URL =
  'https://webtoon.kakao.com/viewer';
export const kakaoWebtoonAxiosConfig = {
  port: null, // port: 80
  headers: {
    authority: 'gateway-kw.kakao.com',
    scheme: 'https',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  },
};
export const BANNER_CONTENT_COUNT = 6;
