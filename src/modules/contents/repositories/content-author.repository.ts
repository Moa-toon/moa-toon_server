import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { ContentAuthor } from '../entities/ContentAuthor';

@CustomRepository(ContentAuthor)
export class ContentAuthorRepository extends Repository<ContentAuthor> {}
