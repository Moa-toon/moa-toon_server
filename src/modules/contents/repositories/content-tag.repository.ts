import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { ContentTag } from '../entities/ContentTag';

@CustomRepository(ContentTag)
export class ContentTagRepoitory extends Repository<ContentTag> {}
