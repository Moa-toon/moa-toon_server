import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GenreInfo,
  PlatformType,
  UpdateDayCode,
  Webtoon,
} from 'src/common/types/contents';
import { Repository } from 'typeorm';
import { Genre } from './entities/Genre';
import { Platform } from './entities/Platform';
import { UpdateDay } from './entities/UpdateDay';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepo: Repository<Platform>,
    @InjectRepository(UpdateDay)
    private readonly updateDayRepo: Repository<UpdateDay>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  getGenres(webtoons: Array<Webtoon>): Array<GenreInfo> {
    const genres = new Array<GenreInfo>();

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

  getAuthors(webtoons: Array<Webtoon>): Set<string> {
    const authors = new Set<string>();
    for (const webtoon of webtoons) {
      for (const author of webtoon.authors) {
        if (author !== '' && !authors.has(author)) authors.add(author);
      }
    }
    return authors;
  }

  async initContentsTbl() {
    try {
      // platform 정보 테이블에 저장
      const platforms: Array<PlatformType> = [
        PlatformType.naver,
        PlatformType.kakao,
        PlatformType.kakaoPage,
      ];
      for (const platformName of platforms) {
        const platformSelected = await this.platformRepo.findBy({
          name: platformName,
        });
        console.log(platformSelected);
        console.log('이미 존재하는 플랫폼 정보');
        if (platformSelected.length > 0) continue;
        const platformSaved = await this.platformRepo.save(
          this.toPlatformEntity(platformName),
        );
        console.log(platformSaved);
      }
      // updateDay 정보 테이블에 저장
      const updateDays: Array<UpdateDayCode> = [
        UpdateDayCode.monday,
        UpdateDayCode.tuesday,
        UpdateDayCode.wednesday,
        UpdateDayCode.thursday,
        UpdateDayCode.friday,
        UpdateDayCode.saturday,
        UpdateDayCode.sunday,
        UpdateDayCode.daily,
        UpdateDayCode.finished,
      ];
      for (const updateDay of updateDays) {
        const updateDaySelected = await this.updateDayRepo.findBy({
          name: updateDay,
        });
        console.log('이미 존재하는 updateDay 데이터');
        if (updateDaySelected.length > 0) continue;
        const updateDaySaved = await this.updateDayRepo.save(
          this.toUpdateDayEntity(updateDay),
        );
        console.log(updateDaySaved);
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveGenres(genres: Array<GenreInfo>): Promise<boolean> {
    try {
      for (const genre of genres) {
        const { main, sub } = genre;

        const genreSelected = await this.genreRepo.findOneBy({ name: main });
        for (const subItem of sub) {
          await this.saveGenre(
            this.toGenreEntity(subItem, genreSelected?.idx ?? undefined),
          );
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveGenre(genre: Genre): Promise<Genre> {
    return this.genreRepo.save(genre);
  }

  toPlatformEntity(name: PlatformType): Platform {
    const platform = new Platform();
    platform.name = name;
    return platform;
  }

  toUpdateDayEntity(name: UpdateDayCode): UpdateDay {
    const updateDay = new UpdateDay();
    updateDay.name = name;
    return updateDay;
  }

  toGenreEntity(name: string, parentIdx: number = 0): Genre {
    const genre = new Genre();
    genre.name = name;
    genre.parentIdx = parentIdx;
    return genre;
  }
}
