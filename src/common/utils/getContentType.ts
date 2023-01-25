import { ContentType } from '../types/contents';

export const getContentType = (type: ContentType): number => {
  switch (type) {
    case ContentType.webtoon:
      return 0;
    case ContentType.webNovel:
      return 1;
    default:
      return null;
  }
};
