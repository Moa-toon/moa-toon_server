import { BANNER_CONTENT_COUNT } from 'src/common/common.constant';
import {
  ContentType,
  PlatformType,
  UpdateDayCode,
} from 'src/common/types/contents';
import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { InsertResult, Repository } from 'typeorm';
import { FindContentsOption } from '../dto/db';
import { SortOptions, SortOptionType } from '../dto/request';
import { Content } from '../entities/Content';

interface SearchContentsOption {
  type?: ContentType;
  updateDay?: UpdateDayCode;
  genres?: string;
  tags?: string;
  platform?: PlatformType;
  keyword?: string;
  sortBy?: SortOptionType;
}
@CustomRepository(Content)
export class ContentRepository extends Repository<Content> {
  async createContent(content: Content): Promise<InsertResult> {
    return this.createQueryBuilder()
      .insert()
      .into(Content)
      .values(content)
      .orUpdate(
        [
          'summary',
          'description',
          'ageLimit',
          'isNew',
          'isPaused',
          'isUpdated',
          'isAdult',
          'urlOfPc',
          'urlOfMobile',
          'thumbnailPath',
          'thumbnailBackgroundPath',
        ],
        ['uuid'],
      )
      .execute();
  }

  async findContentByUUID(uuid: string): Promise<Content> {
    return this.findOneBy({ uuid });
  }

  async findContentByTitle(title: string): Promise<Content> {
    return this.findOneBy({ title });
  }

  async findContentsWithCount(option: FindContentsOption) {
    const qb = this.createQueryBuilder('content')
      .leftJoinAndSelect('content.Platform', 'platform')
      .leftJoinAndSelect('content.ContentUpdateDays', 'contentUpdateDays')
      .leftJoinAndSelect('contentUpdateDays.UpdateDay', 'updateDay');

    if (option.type) {
      qb.andWhere('type = :type', { type: option.type });
    }
    if (option.platform) {
      qb.andWhere('platform.name = :platformName', {
        platformName: option.platform,
      });
    }
    if (option.updateDay) {
      qb.andWhere('updateDay.name = :name', { name: option.updateDay });
    }
    if (option.sortBy) {
      if (option.sortBy === SortOptions.avg_rating) {
      }
    }
    if (option.take) qb.take(option.take);
    if (option.page) qb.skip(option.take * (option.page - 1));
    return qb.getManyAndCount();
  }

  async findContentDetailById(idx: number): Promise<Content> {
    return this.findOne({
      select: {
        idx: true,
        title: true,
        summary: true,
        description: true,
        thumbnailPath: true,
        thumbnailBackgroundPath: true,
        urlOfPc: true,
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
          urlOfPc: true,
          urlOfMobile: true,
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
      where: { idx },
    });
  }

  async findContentDetailByTitle(title: string): Promise<Content> {
    return this.findOne({
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

  async findContentDetailByUUID(uuid: string): Promise<Content> {
    return this.createQueryBuilder('content')
      .select([
        'content.idx',
        'content.uuid',
        'content.title',
        'content.summary',
        'content.description',
        'content.thumbnailPath',
        'content.thumbnailBackgroundPath',
        'content.urlOfPc',
        'content.urlOfMobile',
        'content.ageLimit',
        'content.isUpdated',
        'content.isNew',
        'content.isAdult',
        'platform.name',
        'updateDay.name',
        'author.type',
        'author.name',
        'genre.parentIdx',
        'genre.name',
        'episode.order',
        'episode.title',
        'episode.urlOfPc',
        'episode.urlOfMobile',
        'episode.thumbnailUrl',
        'episode.isFree',
        'episode.createdAt',
      ])
      .leftJoinAndSelect('content.Platform', 'platform')
      .leftJoinAndSelect('content.ContentUpdateDays', 'contentUpdateDay')
      .leftJoinAndSelect('contentUpdateDay.UpdateDay', 'updateDay')
      .leftJoinAndSelect('content.ContentAuthors', 'contentAuthor')
      .leftJoinAndSelect('contentAuthor.Author', 'author')
      .leftJoinAndSelect('content.ContentGenres', 'contentGenre')
      .leftJoinAndSelect('contentGenre.Genre', 'genre')
      .leftJoinAndSelect('content.Episodes', 'episode')
      .where('content.uuid = :uuid', { uuid })
      .orderBy('updateDay.idx', 'ASC')
      .addOrderBy('genre.parentIdx', 'ASC')
      .addOrderBy('episode.order', 'DESC')
      .getOne();
  }

  async findContentIds() {
    return this.find({
      select: {
        uuid: true,
      },
    });
  }

  async searchContentsBy(option: SearchContentsOption) {
    const qb = this.createQueryBuilder('content')
      .leftJoinAndSelect('content.Platform', 'platform')
      .leftJoinAndSelect('content.ContentUpdateDays', 'contentUpdateDays')
      .leftJoinAndSelect('contentUpdateDays.UpdateDay', 'updateDay');

    if (option.type) {
      qb.andWhere('type = :type', { type: option.type });
    }
    if (option.platform) {
      qb.andWhere('platform.name = :platformName', {
        platformName: option.platform,
      });
    }
    if (option.updateDay) {
      qb.andWhere('updateDay.name = :name', { name: option.updateDay });
    }

    if (option.keyword) {
      qb.andWhere(`content.title like '%' :title '%'`, {
        title: option.keyword,
      });
    } else {
      if (option.genres) {
        const genres = option.genres.split(',');
        qb.leftJoin('content.ContentGenres', 'contentGenres').leftJoin(
          'contentGenres.Genre',
          'genre',
        );
        qb.andWhere('genre.name IN (:genreName)', { genreName: genres });
      }
      if (option.tags) {
        const tags = option.tags.split(',');
        qb.leftJoin('content.ContentTags', 'contentTags').leftJoin(
          'contentTags.Tag',
          'tag',
        );
        qb.andWhere('tag.name IN (:tagName)', { tagName: tags });
      }
    }

    if (option.platform)
      qb.andWhere('platform.name = :platformName', {
        platformName: option.platform,
      });

    if (option.sortBy) {
      if (option.sortBy === SortOptions.title) {
        qb.orderBy('content.title');
      }
    }
    return qb.getManyAndCount();
  }

  async findBannerContents() {
    const qb = this.createQueryBuilder('content')
      .leftJoinAndSelect('content.Platform', 'platform')
      .leftJoinAndSelect('content.ContentUpdateDays', 'contentUpdateDays')
      .leftJoinAndSelect('contentUpdateDays.UpdateDay', 'updateDay')
      .leftJoinAndSelect('content.ContentGenres', 'contentGenres')
      .leftJoinAndSelect('contentGenres.Genre', 'genre');
    // 카카오 한정
    qb.where('content.platformIdx = :platformIdx', { platformIdx: 2 });
    // 신작만
    qb.andWhere('content.isNew = :isNew', { isNew: true });
    // 최신순
    qb.addOrderBy('content.startedAt', 'DESC');
    qb.limit(BANNER_CONTENT_COUNT);
    return qb.getMany();
  }
}
