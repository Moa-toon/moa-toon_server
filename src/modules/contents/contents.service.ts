import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GenreInfo,
  Platforms,
  PlatformType,
  UpdateDayCode,
  UpdateDays,
  Webtoon,
} from 'src/common/types/contents';
import { getAgeLimitKor } from 'src/common/utils/getAgeLimitKor';
import { getAuthorTypeKor } from 'src/common/utils/getAuthorTypeKor';
import { getContentType } from 'src/common/utils/getContentType';
import { DataSource, Repository } from 'typeorm';
import { GetContentsReqQueryDto } from './dto/request';
import {
  ContentDetail,
  ContentPaginationData,
  ContentResponse,
  PaginationMetaData,
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
        // const contentSelected = await this.findContentByTitle(content.title);
        // if (contentSelected) continue;
        await this.saveContent(content);
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async saveContent(content: Webtoon): Promise<boolean> {
    return this.dataSource.manager
      .transaction(async (manager) => {
        const platformRepo = manager.withRepository(this.platformRepo);
        const updateDayRepo = manager.withRepository(this.updateDayRepo);
        const authorRepo = manager.withRepository(this.authorRepo);
        const genreRepo = manager.withRepository(this.genreRepo);
        const contentRepo = manager.withRepository(this.contentRepo);

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

        for (const genre of sub) {
          let subGenre: Genre;
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

        let contentEntity: Content;
        const contentSelected = await this.getContentDetailByTitle(
          content.title,
        );

        if (contentSelected) contentEntity = contentSelected;
        else contentEntity = Content.from(content, platform);

        // contentAuthor
        const contentAuthors: Array<ContentAuthor> = [];
        for (const author of authorsSelected) {
          const contentAuthorSelected =
            contentEntity.ContentAuthors.length > 0
              ? contentEntity.ContentAuthors.find(
                  (contentAuthor) =>
                    contentAuthor.AuthorIdx === author.idx &&
                    contentAuthor.ContentIdx === contentEntity.idx,
                )
              : null;
          if (!contentAuthorSelected)
            contentAuthors.push(ContentAuthor.from(contentEntity, author));
        }

        // contentGenre
        const contentGenres: Array<ContentGenre> = [];
        for (const genre of genresSelected) {
          const contentGenreSelected =
            contentEntity.ContentGenres.length > 0
              ? contentEntity.ContentGenres.find(
                  (contentGenre) =>
                    contentGenre.GenreIdx === genre.idx &&
                    contentGenre.ContentIdx === contentEntity.idx,
                )
              : null;
          if (!contentGenreSelected)
            contentGenres.push(ContentGenre.from(contentEntity, genre));
        }

        // contentUpdateDay
        const contentUpdateDays: Array<ContentUpdateDay> = [];
        for (const updateDay of updateDaysSelected) {
          const contentUpdateDaySelected =
            contentEntity.ContentUpdateDays.length > 0
              ? contentEntity.ContentUpdateDays.find(
                  (contentUpdateDay) =>
                    contentUpdateDay.UpdateDayIdx === updateDay.idx &&
                    contentUpdateDay.ContentIdx === contentEntity.idx,
                )
              : null;
          if (!contentUpdateDaySelected)
            contentUpdateDays.push(
              ContentUpdateDay.from(contentEntity, updateDay),
            );
        }

        // episodes
        const contentEpisodes: Array<Episode> = [];
        for (const episodeInfo of content.episodes) {
          // 에피소드 제목이 프롤로그인 경우,
          let order = 0;
          if (episodeInfo.title.match(/\d+/))
            order = parseInt(episodeInfo.title.match(/\d+/)[0]);

          const contentEpisodeSelected =
            contentEntity.Episodes.length > 0
              ? contentEntity.Episodes.find(
                  (episode) =>
                    episode.ContentIdx === contentEntity.idx &&
                    episode.order === order,
                )
              : null;
          if (!contentEpisodeSelected)
            contentEpisodes.push(
              Episode.from({ ...episodeInfo, order }, contentEntity),
            );
        }

        if (contentAuthors.length > 0)
          contentEntity.ContentAuthors = contentAuthors;
        if (contentGenres.length > 0)
          contentEntity.ContentGenres = contentGenres;
        if (contentUpdateDays.length > 0)
          contentEntity.ContentUpdateDays = contentUpdateDays;
        if (contentEpisodes.length > 0)
          contentEntity.Episodes = contentEpisodes;

        await contentRepo.save(contentEntity);
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
      const [contents, totalCount] = await this.contentRepo.findAndCount({
        select: {
          idx: true,
          title: true,
          summary: true,
          thumbnailPath: true,
          urlOfMobile: true,
          ageLimit: true,
          isUpdated: true,
          isNew: true,
          isAdult: true,
        },
        relations: [
          'Platform',
          'ContentUpdateDays',
          'ContentUpdateDays.UpdateDay',
        ],
        where: {
          type: getContentType(type),
          Platform: {
            name: platform,
          },
          ContentUpdateDays: {
            UpdateDay: {
              name: updateDay,
            },
          },
        },
        take: take,
        skip: take * (page - 1),
      });

      const items =
        contents.length > 0
          ? contents.map((content) => ({
              idx: content.idx,
              title: content.title,
              summary: content.summary ?? '',
              ageLimit: content.ageLimit,
              pageUrl: content.urlOfMobile,
              thumbnailUrl: content.thumbnailPath,
              isNew: content.isNew,
              isAdult: content.isAdult,
              isUpdated: content.isUpdated,
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

  async getContentDetailByTitle(title: string): Promise<Content> {
    return this.contentRepo.findOne({
      relations: [
        'Platform',
        'ContentUpdateDays',
        'ContentAuthors',
        'ContentGenres',
        'Episodes',
      ],
      where: { title },
    });
  }

  async getContentDetailById(contentId: number): Promise<ContentDetail> {
    const content = await this.contentRepo.findOne({
      select: {
        idx: true,
        title: true,
        summary: true,
        description: true,
        thumbnailPath: true,
        urlOfMobile: true,
        ageLimit: true,
        isUpdated: true,
        isNew: true,
        isAdult: true,
        ContentUpdateDays: true,
        ContentAuthors: true,
        ContentGenres: true,
        Episodes: {
          order: true,
          title: true,
          pageUrl: true,
          thumbnailUrl: true,
          isFree: true,
          createdAt: true,
        },
      },
      relations: [
        'ContentUpdateDays',
        'ContentUpdateDays.UpdateDay',
        'ContentAuthors',
        'ContentAuthors.Author',
        'ContentGenres',
        'ContentGenres.Genre',
        'Episodes',
      ],
      where: { idx: contentId },
    });
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
      pageUrl: content.urlOfMobile,
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
          pageUrl: episode.pageUrl,
          thumbnailUrl: episode.thumbnailUrl,
          isFree: episode.isFree,
          createdAt: episode.createdAt,
        })),
      },
    };

    return result;
  }

  async getContentsId(): Promise<Array<number>> {
    const contentsSelected = await this.contentRepo.find({
      select: {
        idx: true,
      },
    });
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
}
