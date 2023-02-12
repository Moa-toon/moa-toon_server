import { PlatformType } from 'src/common/types/contents';
import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Platform } from '../entities/Platform';

@CustomRepository(Platform)
export class PlatformRepository extends Repository<Platform> {
  async findOneByName(name: PlatformType): Promise<Platform> {
    return this.findOneBy({ name });
  }
}
