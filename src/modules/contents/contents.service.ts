import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GenreInfo,
  PlatformType,
  UpdateDayCode,
  Webtoon,
} from 'src/common/types/contents';
import { DataSource, Repository } from 'typeorm';
import { Author } from './entities/Author';
import { Content } from './entities/Content';
import { ContentAuthor } from './entities/ContentAuthor';
import { ContentGenre } from './entities/ContentGenre';
import { ContentUpdateDay } from './entities/ContentUpdateDay';
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
    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(ContentAuthor)
    private readonly contentAuthorRepo: Repository<ContentAuthor>,
    @InjectRepository(ContentUpdateDay)
    private readonly contentUpdateDayRepo: Repository<ContentUpdateDay>,
    @InjectRepository(ContentGenre)
    private readonly contentGenreRepo: Repository<ContentGenre>,
    private dataSource: DataSource,
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
    return this.dataSource.manager
      .transaction(async (manager) => {
        const platformRepo = manager.withRepository(this.platformRepo);
        const updateDayRepo = manager.withRepository(this.updateDayRepo);

        // platform 정보 테이블에 저장
        const platforms: Array<PlatformType> = [
          PlatformType.naver,
          PlatformType.kakao,
          PlatformType.kakaoPage,
        ];
        for (const platformName of platforms) {
          const platformSelected = await platformRepo.findOneBy({
            name: platformName,
          });
          if (platformSelected) continue;
          await platformRepo.save(Platform.from(platformName));
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
        for (const updateDayName of updateDays) {
          const updateDaySelected = await this.updateDayRepo.findOneBy({
            name: updateDayName,
          });
          if (updateDaySelected) continue;
          await updateDayRepo.save(UpdateDay.from(updateDayName));
        }
        return true;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  }

  async saveGenres(genres: Array<GenreInfo>): Promise<boolean> {
    try {
      for (const genre of genres) {
        const { main, sub } = genre;
        let mainGenreIdx;
        const mainGenreSelected = await this.findGenreByName(main);
        if (mainGenreSelected) mainGenreIdx = mainGenreSelected.idx;
        else {
          const mainGenreSaved = await this.saveGenre(Genre.from(main));
          mainGenreIdx = mainGenreSaved.idx;
        }

        for (const subItem of sub) {
          const subGenreSelected = await this.findGenreByName(subItem);
          if (subGenreSelected) continue;

          await this.saveGenre(Genre.from(subItem, mainGenreIdx));
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveAuthors(authors: Set<string>) {
    try {
      for (const authorName of authors) {
        const authorSelected = await this.findAuthorByName(authorName);
        if (authorSelected) continue;
        await this.saveAuthor(Author.from(authorName));
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveContents(contents: Array<Webtoon>) {
    try {
      for (const content of contents) {
        const contentSelected = await this.findContentByTitle(content.title);
        if (contentSelected) continue;
        await this.saveContent(content);
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async saveContent(content: Webtoon) {
    try {
      // platform
      let platform: Platform;
      const platformSelected = await this.findPlatformByName(content.platform);
      if (platformSelected) platform = platformSelected;
      else {
        const platformSaved = await this.savePlatform(
          Platform.from(content.platform),
        );
        platform = platformSaved;
      }

      // updateDays
      const updateDaysSelected: Array<UpdateDay> = [];
      for (const updateDayName of content.updateDays) {
        const updateDaySelected = await this.findUpdateDayByName(updateDayName);
        if (updateDaySelected) updateDaysSelected.push(updateDaySelected);
        else {
          // updateDay 정보 저장
          const updateDaySaved = await this.saveUpdateDay(
            UpdateDay.from(updateDayName),
          );
          updateDaysSelected.push(updateDaySaved);
        }
      }
      // authors
      const authorsSelected: Array<Author> = [];
      for (const author of content.authors) {
        const authorSelected = await this.findAuthorByName(author);
        if (authorSelected) authorsSelected.push(authorSelected);
        else {
          // author 정보 저장
          const authorSaved = await this.saveAuthor(Author.from(author));
          authorsSelected.push(authorSaved);
        }
      }
      // genres
      const genresSelected: Array<Genre> = [];
      const [main, ...sub] = content.genres;
      let mainGenre: Genre;
      const mainGenreSelected = await this.findGenreByName(main);
      if (mainGenreSelected) mainGenre = mainGenreSelected;
      else {
        // mainGenre 정보 저장
        const mainGenreSaved = await this.saveGenre(Genre.from(main));
        mainGenre = mainGenreSaved;
      }
      genresSelected.push(mainGenre);

      for (const genre of sub) {
        const subGenreSelected = await this.findGenreByName(genre);
        if (subGenreSelected) genresSelected.push(subGenreSelected);
        else {
          // subGenre 정보 저장
          const subGenreSaved = await this.saveGenre(
            Genre.from(genre, mainGenre.idx),
          );
          genresSelected.push(subGenreSaved);
        }
      }
      const contentSaved = await this.saveContentEntity(
        Content.from(content, platform),
      );
      // contentAuthor
      for (const author of authorsSelected) {
        await this.saveContentAuthor(ContentAuthor.from(contentSaved, author));
      }

      // contentGenre
      for (const genre of genresSelected) {
        await this.saveContentGenre(ContentGenre.from(contentSaved, genre));
      }

      // contentUpdateDay
      for (const updateDay of updateDaysSelected) {
        await this.saveContentUpdateDay(
          ContentUpdateDay.from(contentSaved, updateDay),
        );
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async findUpdateDayByName(name: UpdateDayCode): Promise<UpdateDay> {
    return this.updateDayRepo.findOneBy({ name });
  }

  async findPlatformByName(name: PlatformType): Promise<Platform> {
    return this.platformRepo.findOneBy({ name });
  }

  async findContentByTitle(name: string): Promise<Content> {
    return this.contentRepo.findOneBy({ title: name });
  }

  async findAuthorByName(name: string): Promise<Author> {
    return this.authorRepo.findOneBy({ name });
  }

  async findGenreByName(name: string): Promise<Genre> {
    return this.genreRepo.findOneBy({ name });
  }

  async saveGenre(genre: Genre): Promise<Genre> {
    return this.genreRepo.save(genre);
  }

  async saveContentEntity(content: Content): Promise<Content> {
    return this.contentRepo.save(content);
  }

  async savePlatform(platform: Platform): Promise<Platform> {
    return this.platformRepo.save(platform);
  }

  async saveUpdateDay(updateDay: UpdateDay): Promise<UpdateDay> {
    return this.updateDayRepo.save(updateDay);
  }

  async saveAuthor(author: Author): Promise<Author> {
    return this.authorRepo.save(author);
  }

  async saveContentAuthor(
    contentAuthor: ContentAuthor,
  ): Promise<ContentAuthor> {
    return this.contentAuthorRepo.save(contentAuthor);
  }

  async saveContentUpdateDay(
    contentUpdateDay: ContentUpdateDay,
  ): Promise<ContentUpdateDay> {
    return this.contentUpdateDayRepo.save(contentUpdateDay);
  }

  async saveContentGenre(contentGenre: ContentGenre): Promise<ContentGenre> {
    return this.contentGenreRepo.save(contentGenre);
  }
}
