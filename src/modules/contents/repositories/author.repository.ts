import { WebtoonAuthorTypeCode } from 'src/common/types/contents';
import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Author } from '../entities/Author';

@CustomRepository(Author)
export class AuthorRepository extends Repository<Author> {
  async findOneByNameAndType(
    name: string,
    type: WebtoonAuthorTypeCode,
  ): Promise<Author> {
    return this.findOneBy({ name, type });
  }
}
