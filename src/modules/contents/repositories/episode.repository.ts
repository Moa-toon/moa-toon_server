import { CustomRepository } from 'src/modules/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Episode } from '../entities/Episode';

@CustomRepository(Episode)
export class EpisodeRepository extends Repository<Episode> {}
