import { Injectable } from '@nestjs/common';
import { Webtoon } from 'src/common/types/contents';

@Injectable()
export class ContentsService {
  constructor() {}

  getGenres(webtoons: Array<Webtoon>): Array<{
    main: string;
    sub: Set<string>;
  }> {
    console.log('getGenres 메서드 호출!!!');
    const genres = new Array<{
      main: string;
      sub: Set<string>;
    }>();

    for (const webtoon of webtoons) {
      // webtoon.genres
      const [mainGenreName, ...otherGenreNames] = webtoon.genres;

      let isMainGenreExist = false;
      for (const genre of genres) {
        if (genre.main === mainGenreName) {
          isMainGenreExist = true;
          break;
        }
      }

      if (mainGenreName !== '' && !isMainGenreExist) {
        const genre = { main: mainGenreName, sub: new Set<string>() };
        genres.push(genre);
      }

      for (const otherGenreName of otherGenreNames) {
        const genreItem = genres.find((genre) => genre.main === mainGenreName);

        if (genreItem && !genreItem.sub.has(otherGenreName)) {
          genreItem.sub.add(otherGenreName);
        }
      }
    }
    return genres;
  }
}
