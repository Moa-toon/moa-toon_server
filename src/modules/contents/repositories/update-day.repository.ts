import { UpdateDayCode } from 'src/common/types/contents';
import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { UpdateDay } from '../entities/UpdateDay';

@CustomRepository(UpdateDay)
export class UpdateDayRepository extends Repository<UpdateDay> {
  async findUpdateDayByName(name: UpdateDayCode): Promise<UpdateDay> {
    return this.findOneBy({ name });
  }
}
