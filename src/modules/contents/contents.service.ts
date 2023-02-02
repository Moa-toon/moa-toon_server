import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Contents,
  GenreInfo,
  Platforms,
  PlatformType,
  UpdateDayCode,
  UpdateDays,
  Webtoon,
} from 'src/common/types/contents';
import { generateRandomAvgRating } from 'src/common/utils/generateRandomAvgRating';
import { getAgeLimitKor } from 'src/common/utils/getAgeLimitKor';
import { getAuthorTypeKor } from 'src/common/utils/getAuthorTypeKor';
import { getContentType } from 'src/common/utils/getContentType';
import { getUniqueIdxByPlatform } from 'src/common/utils/getUniqueIdxByPlatform';
import { DataSource, Repository } from 'typeorm';
import {
  GetContentsReqQueryDto,
  SearchContentsReqQueryDto,
} from './dto/request';
import {
  ContentDetail,
  ContentPaginationData,
  PaginationMetaData,
  SearchOptions,
} from './dto/response';
import { Author } from './entities/Author';
import { Content } from './entities/Content';
import { ContentAuthor } from './entities/ContentAuthor';
import { ContentGenre } from './entities/ContentGenre';
import { ContentUpdateDay } from './entities/ContentUpdateDay';
import { Episode } from './entities/Episode';
import { Genre } from './entities/Genre';
import { Platform } from './entities/Platform';
import { UpdateDay } from './entities/UpdateDay';
import { ContentRepository } from './repositories/contents.repository';

@Injectable()
export class ContentsService {
  private propertiesToUpdate = [
    'title',
    'description',
    'ageLimit',
    'isNew',
    'isAdult',
    'isPaused',
    'isUpdated',
    'thumbnailPath',
    'summary',
  ];

  constructor(
    @InjectRepository(Platform)
    private readonly platformRepo: Repository<Platform>,
    @InjectRepository(UpdateDay)
    private readonly updateDayRepo: Repository<UpdateDay>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,
    private readonly contentRepo: ContentRepository,
    @InjectRepository(ContentAuthor)
    private readonly contentAuthorRepo: Repository<ContentAuthor>,
    @InjectRepository(ContentGenre)
    private readonly contentGenreRepo: Repository<ContentGenre>,
    @InjectRepository(ContentUpdateDay)
    private readonly contentUpdateDayRepo: Repository<ContentUpdateDay>,
    @InjectRepository(Episode)
    private readonly episodeRepo: Repository<Episode>,
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
          Platforms.naver,
          Platforms.kakao,
          Platforms.kakaoPage,
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
          UpdateDays.monday,
          UpdateDays.tuesday,
          UpdateDays.wednesday,
          UpdateDays.thursday,
          UpdateDays.friday,
          UpdateDays.saturday,
          UpdateDays.sunday,
          UpdateDays.daily,
          UpdateDays.finished,
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

  async saveContents(contents: Array<Webtoon>): Promise<boolean> {
    try {
      for (const content of contents) {
        await this.saveContent(content);
      }
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async saveContent(content: Webtoon): Promise<boolean> {
    let contentEntity: Content;
    return this.dataSource.manager
      .transaction(async (manager) => {
        const platformRepo = manager.withRepository(this.platformRepo);
        const updateDayRepo = manager.withRepository(this.updateDayRepo);
        const authorRepo = manager.withRepository(this.authorRepo);
        const genreRepo = manager.withRepository(this.genreRepo);
        const contentRepo = manager.withRepository(this.contentRepo);
        const contentUpdateDayRepo = manager.withRepository(
          this.contentUpdateDayRepo,
        );
        const contentGenreRepo = manager.withRepository(this.contentGenreRepo);
        const contentAuthorRepo = manager.withRepository(
          this.contentAuthorRepo,
        );
        const episodeRepo = manager.withRepository(this.episodeRepo);
        // platform
        let platform: Platform;
        const platformSelected = await platformRepo.findOneBy({
          name: content.platform,
        });
        if (platformSelected) platform = platformSelected;
        else {
          const platformSaved = await platformRepo.save(
            Platform.from(content.platform),
          );
          platform = platformSaved;
        }
        // updateDays
        const updateDaysSelected: Array<UpdateDay> = [];
        for (const updateDayName of content.updateDays) {
          const updateDaySelected = await updateDayRepo.findOneBy({
            name: updateDayName,
          });
          if (updateDaySelected) updateDaysSelected.push(updateDaySelected);
          else {
            // updateDay 정보 저장
            const updateDaySaved = await updateDayRepo.save(
              UpdateDay.from(updateDayName),
            );
            updateDaysSelected.push(updateDaySaved);
          }
        }
        // authors
        const authorsSelected: Array<Author> = [];
        for (const author of content.authors) {
          const authorSelected = await authorRepo.findOneBy({
            name: author,
          });
          if (authorSelected) authorsSelected.push(authorSelected);
          else {
            // author 정보 저장
            const authorSaved = await authorRepo.save(Author.from(author));
            authorsSelected.push(authorSaved);
          }
        }
        // genres
        const genresSelected: Array<Genre> = [];
        const [main, ...sub] = content.genres;
        let mainGenre: Genre;
        if (main !== '') {
          const mainGenreSelected = await genreRepo.findOneBy({
            name: main,
          });
          if (mainGenreSelected) mainGenre = mainGenreSelected;
          else {
            // mainGenre 정보 저장
            const mainGenreSaved = await genreRepo.save(Genre.from(main));
            mainGenre = mainGenreSaved;
          }
          genresSelected.push(mainGenre);
        }

        for (const genre of sub) {
          let subGenre: Genre;
          if (genre !== '') {
            const subGenreSelected = await genreRepo.findOneBy({
              name: genre,
            });
            if (subGenreSelected) subGenre = subGenreSelected;
            else {
              // subGenre 정보 저장
              const subGenreSaved = await genreRepo.save(
                Genre.from(genre, mainGenre.idx),
              );
              subGenre = subGenreSaved;
            }
            genresSelected.push(subGenre);
          }
        }

        const contentSelected = await this.getContentDetailByUUID(
          `${getUniqueIdxByPlatform(platform.name)}${content.id}`,
        );

        if (contentSelected) {
          // contentEntity와 content 비교 후 데이터 업데이트
          contentEntity = this.compareAndUpdate(contentSelected, content);
        } else contentEntity = Content.from(content, platform);
        const contentSaved = await contentRepo.createContent(contentEntity);
        // contentSaved
        const savedContentIdx = contentSaved.identifiers[0]['idx'];
        // contentAuthor
        const contentAuthors: Array<ContentAuthor> = [];
        if (authorsSelected.length > 0) {
          for (const author of authorsSelected) {
            const contentAuthorSelected =
              contentEntity.ContentAuthors?.length > 0
                ? contentEntity.ContentAuthors.find(
                    (contentAuthor) => contentAuthor.AuthorIdx === author.idx,
                  )
                : null;
            if (!contentAuthorSelected)
              contentAuthors.push(ContentAuthor.from(savedContentIdx, author));
          }
          contentAuthors.length > 0 &&
            (await contentAuthorRepo.save(contentAuthors));
        }
        // contentGenre
        const contentGenres: Array<ContentGenre> = [];
        if (genresSelected.length > 0) {
          for (const genre of genresSelected) {
            const contentGenreSelected =
              contentEntity.ContentGenres?.length > 0
                ? contentEntity.ContentGenres.find(
                    (contentGenre) => contentGenre.GenreIdx === genre.idx,
                  )
                : null;
            if (!contentGenreSelected)
              contentGenres.push(ContentGenre.from(savedContentIdx, genre));
          }
          contentGenres.length > 0 &&
            (await contentGenreRepo.save(contentGenres));
        }

        // contentUpdateDay
        const contentUpdateDays: Array<ContentUpdateDay> = [];
        if (updateDaysSelected.length > 0) {
          for (const updateDay of updateDaysSelected) {
            const contentUpdateDaySelected =
              contentEntity.ContentUpdateDays?.length > 0
                ? contentEntity.ContentUpdateDays.find(
                    (contentUpdateDay) =>
                      contentUpdateDay.UpdateDayIdx === updateDay.idx,
                  )
                : null;
            if (!contentUpdateDaySelected)
              contentUpdateDays.push(
                ContentUpdateDay.from(savedContentIdx, updateDay),
              );
          }
          contentUpdateDays.length > 0 &&
            (await contentUpdateDayRepo.save(contentUpdateDays));
        }

        // episodes
        const contentEpisodes: Array<Episode> = [];
        let order = 1;
        if (content.episodes?.length > 0) {
          for (const episodeInfo of content.episodes) {
            const contentEpisodeSelected =
              contentEntity.Episodes?.length > 0
                ? contentEntity.Episodes.find(
                    (episode) =>
                      episode.title === episodeInfo.title &&
                      episode.urlOfMobile === episodeInfo.urlOfMobile &&
                      episode.urlOfPc === episodeInfo.urlOfPc,
                  )
                : null;
            if (!contentEpisodeSelected) {
              const contentEpisode = Episode.from(savedContentIdx, {
                ...episodeInfo,
                order,
              });
              contentEpisodes.push(contentEpisode);
            }
            order++;
          }
          contentEpisodes.length > 0 &&
            (await episodeRepo.save(contentEpisodes));
        }

        return true;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }

  async getContents(
    query: GetContentsReqQueryDto,
  ): Promise<ContentPaginationData> {
    const { type, platform, updateDay, page, take } = query;

    try {
      const [contents, totalCount] =
        await this.contentRepo.findContentsWithCount({
          type: getContentType(type),
          platform,
          updateDay,
          page,
          take,
        });

      const items =
        contents.length > 0
          ? contents.map((content) => ({
              idx: content.idx,
              platform: content.Platform.name,
              title: content.title,
              summary: content.summary ?? '',
              ageLimit: content.ageLimit,
              urlOfPc: content.urlOfPc,
              urlOfMobile: content.urlOfMobile,
              thumbnailUrl: content.thumbnailPath,
              isNew: content.isNew,
              isAdult: content.isAdult,
              isUpdated: content.isUpdated,
              avgRating: generateRandomAvgRating(0.0, 5.0, 1),
            }))
          : [];
      const meta: PaginationMetaData = {
        totalCount,
        pageCount: Math.ceil(totalCount / take),
      };

      return {
        items,
        meta,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getContentByUUID(uuid: string): Promise<Content> {
    return this.contentRepo.findContentByUUID(uuid);
  }

  async getContentDetailByTitle(title: string): Promise<Content> {
    return this.contentRepo.findContentDetailByTitle(title);
  }

  async getContentDetailById(contentId: number): Promise<ContentDetail> {
    const content = await this.contentRepo.findContentDetailById(contentId);
    if (!content) return null;

    const result = {
      idx: content.idx,
      genre: {
        main: content.ContentGenres.find(
          (contentGenre) => contentGenre.Genre.parentIdx === 0,
        ).Genre.name,
        sub: content.ContentGenres.filter(
          (contentGenre) => contentGenre.Genre.parentIdx === 1,
        ).map((contentGenre) => contentGenre.Genre.name),
      },
      title: content.title,
      description: content.description,
      ageLimitKor: getAgeLimitKor(content.ageLimit),
      urlOfPc: content.urlOfPc,
      urlOfMobile: content.urlOfMobile,
      thumbnailUrl: content.thumbnailPath,
      isNew: content.isNew,
      isUpdated: content.isUpdated,
      isAdult: content.isAdult,
      authors: content.ContentAuthors.map((contentAuthor) => ({
        type: getAuthorTypeKor(contentAuthor.Author.type),
        name: contentAuthor.Author.name,
      })),
      episodes: {
        totalCount: content.Episodes.length,
        items: content.Episodes.map((episode) => ({
          order: episode.order,
          title: episode.title,
          urlOfPc: episode.urlOfPc,
          urlOfMobile: episode.urlOfMobile,
          thumbnailUrl: episode.thumbnailUrl,
          isFree: episode.isFree,
          createdAt: episode.createdAt,
        })),
      },
    };

    return result;
  }

  async getContentDetailByUUID(uuid: string): Promise<Content> {
    return this.contentRepo.findContentDetailByUUID(uuid);
  }

  async getContentsId(): Promise<Array<number>> {
    const contentsSelected = await this.contentRepo.findContentIds();
    const ids =
      contentsSelected.length > 0
        ? contentsSelected.map((content) => content.idx)
        : [];
    return ids;
  }

  async findUpdateDayByName(name: UpdateDayCode): Promise<UpdateDay> {
    return this.updateDayRepo.findOneBy({ name });
  }

  async findPlatformByName(name: PlatformType): Promise<Platform> {
    return this.platformRepo.findOneBy({ name });
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

  async savePlatform(platform: Platform): Promise<Platform> {
    return this.platformRepo.save(platform);
  }

  async saveUpdateDay(updateDay: UpdateDay): Promise<UpdateDay> {
    return this.updateDayRepo.save(updateDay);
  }

  async saveAuthor(author: Author): Promise<Author> {
    return this.authorRepo.save(author);
  }

  compareAndUpdate(contentEntity: Content, contentDto: Webtoon): Content {
    // contentEntity와 content 비교
    // contentEntity: urlOfPc, urlOfMobile
    for (const [key, val] of Object.entries(contentEntity)) {
      // title, summary, description, ageLimit, thumbnailPath
      if (
        [
          'title',
          'summary',
          'description',
          'ageLimit',
          'thumbnailPath',
        ].includes(key)
      ) {
        if (val !== contentDto[key]) {
          console.log(`[${contentEntity.idx}] ${key} 데이터가 일치하지 않음.`);
          contentEntity[key] = contentDto[key];
        }
      } else if (['isNew', 'isAdult', 'isPaused', 'isUpdated'].includes(key)) {
        if (val !== contentDto.additional[key]) {
          console.log(`[${contentEntity.idx}] ${key} 데이터가 일치하지 않음.`);
          contentEntity[key] = contentDto.additional[key];
        }
      } else if (key === 'urlOfMobile') {
        if (val !== contentDto.urlOfMobile) {
          console.log(`[${contentEntity.idx}] ${key} 데이터가 일치하지 않음.`);
          contentEntity[key] = contentDto.urlOfMobile;
        }
      } else if (key === 'urlOfPc') {
        if (val !== contentDto.urlOfPc) {
          console.log(`[${contentEntity.idx}] ${key} 데이터가 일치하지 않음.`);
          contentEntity[key] = contentDto.urlOfPc;
        }
      }
    }
    return contentEntity;
  }

  async searchContents(
    query: SearchContentsReqQueryDto,
  ): Promise<ContentPaginationData> {
    try {
      const [contents, totalCount] = await this.contentRepo.searchContentsBy(
        query,
      );
      const items =
        contents.length > 0
          ? contents.map((content) => ({
              idx: content.idx,
              platform: content.Platform.name,
              title: content.title,
              summary: content.summary ?? '',
              ageLimit: content.ageLimit,
              urlOfPc: content.urlOfPc,
              urlOfMobile: content.urlOfMobile,
              thumbnailUrl: content.thumbnailPath,
              isNew: content.isNew,
              isAdult: content.isAdult,
              isUpdated: content.isUpdated,
              avgRating: generateRandomAvgRating(0.0, 5.0, 1),
            }))
          : [];
      const meta: PaginationMetaData = {
        totalCount,
      };
      return {
        items,
        meta,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getSearchOptions(): Promise<SearchOptions> {
    // {
    //   "genres": [”개그”, “공포”, “드라마”, “로맨스”, … ],
    //   "tags": [”가족”, “감동”, “게임”, “동물”, “동양풍”, … ],
    //   "isFinished": [true, false],
    //   "type": ["webtoon", "webNovel"],
    //   "platforms": [“naver”, “kakao”, “kakaoPage”]
    // }
    try {
      const genres = await this.genreRepo
        .createQueryBuilder('g')
        .where(`g.name != :name`, { name: '' })
        .select('g.name')
        .getMany();
      const platforms = await this.platformRepo
        .createQueryBuilder('p')
        .where(`p.name != :name`, { name: '' })
        .select('p.name')
        .getMany();
      const type = [Contents.webtoon, Contents.webNovel];
      const isFinished = [true, false];
      return {
        genres: genres.length > 0 ? genres.map((genre) => genre.name) : [],
        isFinished,
        platforms:
          platforms.length > 0
            ? platforms.map((platform) => platform.name)
            : [],
        type,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
