import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { ContentUpdateDay } from '../entities/ContentUpdateDay';

@CustomRepository(ContentUpdateDay)
export class ContentUpdateDayRepository extends Repository<ContentUpdateDay> {}
