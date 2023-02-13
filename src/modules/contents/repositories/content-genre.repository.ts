import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { ContentGenre } from '../entities/ContentGenre';

@CustomRepository(ContentGenre)
export class ContentGenreRepository extends Repository<ContentGenre> {}
