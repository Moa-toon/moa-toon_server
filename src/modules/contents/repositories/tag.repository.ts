import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Tag } from '../entities/Tag';

@CustomRepository(Tag)
export class TagRepository extends Repository<Tag> {
  async findOneByName(name: string): Promise<Tag> {
    return this.findOneBy({ name });
  }
}
