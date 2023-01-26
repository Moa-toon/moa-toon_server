import { Contents, ContentType } from '../types/contents';

export const getContentType = (type: ContentType): number => {
  switch (type) {
    case Contents.webtoon:
      return 0;
    case Contents.webNovel:
      return 1;
    default:
      return null;
  }
};
