import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from 'src/modules/contents/entities/Author';
import { Content } from 'src/modules/contents/entities/Content';
import { ContentAuthor } from 'src/modules/contents/entities/ContentAuthor';
import { ContentGenre } from 'src/modules/contents/entities/ContentGenre';
import { ContentTag } from 'src/modules/contents/entities/ContentTag';
import { ContentUpdateDay } from 'src/modules/contents/entities/ContentUpdateDay';
import { Episode } from 'src/modules/contents/entities/Episode';
import { Genre } from 'src/modules/contents/entities/Genre';
import { Platform } from 'src/modules/contents/entities/Platform';
import { Tag } from 'src/modules/contents/entities/Tag';
import { UpdateDay } from 'src/modules/contents/entities/UpdateDay';

// app의 DB 설정 및 TypeOrm Entity 설정에 대한 값 설정을 한다.
const isProd = process.env.NODE_ENV === 'production' ? true : false;
export function getTypeOrmModule() {
  return TypeOrmModule.forRootAsync({
    useFactory: () => {
      return {
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [
          Content,
          Platform,
          Author,
          Genre,
          UpdateDay,
          ContentAuthor,
          ContentGenre,
          ContentUpdateDay,
          Episode,
          Tag,
          ContentTag,
        ],
        synchronize: !isProd ? true : false,
        logging: !isProd ? true : false,
        // logging: false,
      };
    },
  });
}
