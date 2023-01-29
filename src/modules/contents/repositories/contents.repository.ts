import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { FindOptionsWhere, InsertResult, Repository } from 'typeorm';
import { FindContentsOption } from '../dto/db';
import { Content } from '../entities/Content';

@CustomRepository(Content)
export class ContentRepository extends Repository<Content> {
  async createContent(content: Content): Promise<InsertResult> {
    return this.createQueryBuilder()
      .insert()
      .into(Content)
      .values(content)
      .orUpdate(
        ['uuid'],
        [
          'title',
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
        ],
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
    const whereOption: FindOptionsWhere<Content> = {};
    if (option.type) whereOption.type = option.type;
    if (option.platform) whereOption.Platform = { name: option.platform };
    if (option.updateDay)
      whereOption.ContentUpdateDays = { UpdateDay: { name: option.updateDay } };

    return this.findAndCount({
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
      where: whereOption,
      take: option.take,
      skip: option.take * (option.page - 1),
    });
  }

  async findContentDetailById(idx: number): Promise<Content> {
    return this.findOne({
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
    return this.findOne({
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
      where: { uuid },
    });
  }

  async findContentIds() {
    return this.find({
      select: {
        idx: true,
      },
    });
  }
}
