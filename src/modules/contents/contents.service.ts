import { Injectable } from '@nestjs/common';
import {
  Contents,
  GenreInfo,
  Platforms,
  PlatformType,
  UpdateDayCode,
  UpdateDays,
  Webtoon,
  WebtoonAdditionalInfo,
} from 'src/common/types/contents';
import { WebtoonAuthor } from 'src/common/types/contents';
import { generateRandomAvgRating } from 'src/common/utils/generateRandomAvgRating';
import { getAgeLimitKor } from 'src/common/utils/getAgeLimitKor';
import { getAuthorTypeKor } from 'src/common/utils/getAuthorTypeKor';
import { getContentType } from 'src/common/utils/getContentType';
import { getCurrentDay } from 'src/common/utils/getCurrentDay';
import { getUniqueIdxByPlatform } from 'src/common/utils/getUniqueIdxByPlatform';
import { getUpdateDayKor } from 'src/common/utils/getUpdateDayKor';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
import { ContentTag } from './entities/ContentTag';
import { ContentUpdateDay } from './entities/ContentUpdateDay';
import { Episode } from './entities/Episode';
import { Genre } from './entities/Genre';
import { Platform } from './entities/Platform';
import { Tag } from './entities/Tag';
import { UpdateDay } from './entities/UpdateDay';
import { AuthorRepository } from './repositories/author.repository';
import { ContentAuthorRepository } from './repositories/content-author.repository';
import { ContentGenreRepository } from './repositories/content-genre.repository';
import { ContentTagRepoitory } from './repositories/content-tag.repository';
import { ContentUpdateDayRepository } from './repositories/content-update-day.repository';
import { ContentRepository } from './repositories/contents.repository';
import { EpisodeRepository } from './repositories/episode.repository';
import { GenreRepository } from './repositories/genre.repository';
import { PlatformRepository } from './repositories/platform.repository';
import { TagRepository } from './repositories/tag.repository';
import { UpdateDayRepository } from './repositories/update-day.repository';

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
    private readonly platformRepo: PlatformRepository,
    private readonly updateDayRepo: UpdateDayRepository,
    private readonly genreRepo: GenreRepository,
    private readonly authorRepo: AuthorRepository,
    private readonly contentRepo: ContentRepository,
    private readonly contentAuthorRepo: ContentAuthorRepository,
    private readonly contentGenreRepo: ContentGenreRepository,
    private readonly contentUpdateDayRepo: ContentUpdateDayRepository,
    private readonly episodeRepo: EpisodeRepository,
    private readonly tagRepo: TagRepository,
    private readonly contentTagRepo: ContentTagRepoitory,
    private dataSource: DataSource,
  ) {}

  getGenres(
    webtoons: Array<Webtoon> | Array<WebtoonAdditionalInfo>,
  ): Array<GenreInfo> {
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

        if (
          otherGenreName !== '' &&
          genreItem &&
          !genreItem.sub.has(otherGenreName)
        ) {
          genreItem.sub.add(otherGenreName);
        }
      }
    }
    return genres;
  }

  getAuthors(webtoons: Array<Webtoon>): Array<WebtoonAuthor> {
    const authors = new Array<WebtoonAuthor>();
    for (const webtoon of webtoons) {
      for (const author of webtoon.authors) {
        const isNameExist = authors.find(
          (authorSaved) =>
            authorSaved.name === author.name &&
            authorSaved.type === author.type,
        );
        if (author.name !== '' && !isNameExist) authors.push(author);
      }
    }
    return authors;
  }

  getTags(webtoons: Array<Webtoon>): Set<string> {
    if (webtoons[0].platform === Platforms.naver) return null;

    const tags = new Set<string>();
    for (const webtoon of webtoons) {
      for (const tag of webtoon.tags) {
        const isTagExist = tags.has(tag);
        if (tag !== '' && !isTagExist) tags.add(tag);
      }
    }
    return tags;
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
          const platformSelected = await platformRepo.findOneByName(
            platformName,
          );
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
        const mainGenreSelected = await this.genreRepo.findOneByName(main);
        if (mainGenreSelected) mainGenreIdx = mainGenreSelected.idx;
        else {
          const mainGenreSaved = await this.genreRepo.save(Genre.from(main));
          mainGenreIdx = mainGenreSaved.idx;
        }

        for (const subItem of sub) {
          const subGenreSelected = await this.genreRepo.findOneByName(subItem);
          if (subGenreSelected) continue;

          await this.genreRepo.save(Genre.from(subItem, mainGenreIdx));
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveAuthors(authors: Array<WebtoonAuthor>) {
    try {
      for (const author of authors) {
        const authorSelected = await this.authorRepo.findOneByNameAndType(
          author.name,
          author.type,
        );
        if (authorSelected) continue;
        await this.authorRepo.save(Author.from(author.name, author.type));
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveTags(tags: Set<string>) {
    try {
      for (const tagName of tags) {
        const tagSelected = await this.tagRepo.findOneByName(tagName);
        if (tagSelected) continue;
        await this.tagRepo.save(Tag.from(tagName));
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async saveContents(contents: Array<Webtoon>): Promise<boolean> {
    return this.dataSource.manager
      .transaction(async (manager) => {
        for (const content of contents) {
          await this.saveContent(manager, content);
        }
        return true;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async saveContent(manager: EntityManager, content: Webtoon): Promise<void> {
    let contentEntity: Content;
    const platformRepo = manager.withRepository(this.platformRepo);
    const updateDayRepo = manager.withRepository(this.updateDayRepo);
    const authorRepo = manager.withRepository(this.authorRepo);
    const genreRepo = manager.withRepository(this.genreRepo);
    const contentRepo = manager.withRepository(this.contentRepo);
    const contentUpdateDayRepo = manager.withRepository(
      this.contentUpdateDayRepo,
    );
    const contentGenreRepo = manager.withRepository(this.contentGenreRepo);
    const contentAuthorRepo = manager.withRepository(this.contentAuthorRepo);
    const episodeRepo = manager.withRepository(this.episodeRepo);
    const tagRepo = manager.withRepository(this.tagRepo);
    const contentTagRepo = manager.withRepository(this.contentTagRepo);

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
        name: author.name,
        type: author.type,
      });
      const authorSearched = authorsSelected.find(
        (authorSelected) =>
          authorSelected.name === author.name &&
          authorSelected.type === author.type,
      );
      if (authorSelected && !authorSearched)
        authorsSelected.push(authorSelected);
      else if (!authorSelected && !authorSearched) {
        // author 정보 저장
        const authorSaved = await authorRepo.save(
          Author.from(author.name, author.type),
        );
        authorsSelected.push(authorSaved);
      }
    }
    // genres
    const genresSelected: Array<Genre> = [];
    const [main, ...sub] = content.genres;
    let mainGenre: Genre;
    if (main !== '') {
      const mainGenreSelected = await genreRepo.findOneByName(main);
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
        const subGenreSelected = await genreRepo.findOneByName(genre);
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

    // Tag
    const tagsSelected: Array<Tag> = [];
    if (content.tags && content.tags.length > 0) {
      for (const tagName of content.tags) {
        const tagSelected = await this.tagRepo.findOneByName(tagName);
        const tagSearched = tagsSelected.find(
          (tagSelected) => tagSelected.name === tagName,
        );
        if (tagSelected && !tagSearched) tagsSelected.push(tagSelected);
        else if (!tagSelected && !tagSearched) {
          // tag 정보 저장
          const tagSaved = await tagRepo.save(Tag.from(tagName));
          tagsSelected.push(tagSaved);
        }
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
      contentGenres.length > 0 && (await contentGenreRepo.save(contentGenres));
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
      contentEpisodes.length > 0 && (await episodeRepo.save(contentEpisodes));
    }

    // contentTags
    const contentTags: Array<ContentTag> = [];
    if (tagsSelected.length > 0) {
      for (const tag of tagsSelected) {
        const contentTagSelected =
          contentEntity.ContentTags?.length > 0
            ? contentEntity.ContentTags.find(
                (contentTag) => contentTag.TagIdx === tag.idx,
              )
            : null;
        if (!contentTagSelected)
          contentTags.push(ContentTag.from(savedContentIdx, tag));
      }
      contentTags.length > 0 && (await contentTagRepo.save(contentTags));
    }
  }

  async getContents(
    query: GetContentsReqQueryDto,
  ): Promise<ContentPaginationData> {
    const { type, platform, updateDay, page, take, sortBy } = query;

    try {
      const [contents, totalCount] =
        await this.contentRepo.findContentsWithCount({
          type: getContentType(type),
          platform,
          updateDay,
          page,
          take,
          sortBy,
        });

      const items =
        contents.length > 0
          ? contents.map((content) => ({
              idx: parseInt(content.uuid),
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

      if (query.sortBy === 'avg_rating') {
        items.sort((a, b) => b.avgRating - a.avgRating);
      }
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

  async getContentDetailById(contentId: string): Promise<ContentDetail> {
    const content = await this.contentRepo.findContentDetailByUUID(contentId);
    if (!content) return null;
    const result = {
      idx: parseInt(content.uuid),
      platform: content.Platform.name,
      genre:
        content.ContentGenres?.length > 0
          ? content.ContentGenres.map((contentGenre) => contentGenre.Genre.name)
          : [],
      updateDays:
        content.ContentUpdateDays.length > 0
          ? content.ContentUpdateDays.map((item) =>
              getUpdateDayKor(item.UpdateDay.name),
            )
          : [],
      title: content.title,
      description: content.description,
      ageLimitKor: getAgeLimitKor(content.ageLimit),
      urlOfPc: content.urlOfPc,
      urlOfMobile: content.urlOfMobile,
      thumbnailUrl: content.thumbnailPath,
      isNew: content.isNew,
      isUpdated: content.isUpdated,
      isAdult: content.isAdult,
      authors:
        content.ContentAuthors.length > 0
          ? content.ContentAuthors.map((contentAuthor) => ({
              type: getAuthorTypeKor(contentAuthor.Author.type),
              name: contentAuthor.Author.name,
            }))
          : [],
      avgRating: generateRandomAvgRating(0.0, 5.0, 1),
      episodes: {
        totalCount: content.Episodes.length > 0 ? content.Episodes.length : 0,
        items:
          content.Episodes.length > 0
            ? content.Episodes.map((episode) => ({
                order: episode.order,
                title: episode.title,
                urlOfPc: episode.urlOfPc,
                urlOfMobile: episode.urlOfMobile,
                thumbnailUrl: episode.thumbnailUrl,
                isFree: episode.isFree,
                createdAt: episode.createdAt,
              }))
            : [],
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
        ? contentsSelected.map((content) => parseInt(content.uuid))
        : [];
    return ids;
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
          'urlOfPc',
          'urlOfMobile',
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
              idx: parseInt(content.uuid),
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

  async getBannerContents() {
    try {
      const today = getCurrentDay() as UpdateDayCode;
      const contents = await this.contentRepo.findTodayBannerContents(today);
      const bannerContents = this.getEveryPlatformContentsBy(contents, 2);
      const items =
        bannerContents.length > 0
          ? bannerContents.map((content) => ({
              idx: parseInt(content.uuid),
              platform: content.Platform.name,
              type: content.type === 0 ? 'webtoon' : 'webNovel',
              genres:
                content.ContentGenres?.length > 0
                  ? content.ContentGenres.map(
                      (contentGenre) => contentGenre.Genre.name,
                    )
                  : [],
              title: content.title,
              summary: content.summary ?? '',
              ageLimit: content.ageLimit,
              thumbnailUrl: content.thumbnailPath,
              isNew: content.isNew,
              isAdult: content.isAdult,
            }))
          : [];
      return items;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  getEveryPlatformContentsBy(contents: Content[], limit: number): Content[] {
    if (contents.length === 0) return [];

    const filteredContents = [];
    let naverCount = 0,
      kakaoCount = 0;
    for (const content of contents) {
      if (content.Platform.name === 'kakao') {
        if (kakaoCount === limit) continue;
        filteredContents.push(content);
        kakaoCount++;
      } else if (content.Platform.name === 'naver') {
        if (naverCount === limit) continue;
        filteredContents.push(content);
        naverCount++;
      }
    }
    return filteredContents;
  }
}
