import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Genre } from '../entities/Genre';

@CustomRepository(Genre)
export class GenreRepository extends Repository<Genre> {
  async findOneByName(name: string): Promise<Genre> {
    return this.findOneBy({ name });
  }
}
