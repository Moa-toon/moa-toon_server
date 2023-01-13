import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ContentAuthor } from './ContentAuthor';

@Entity('author')
export class Author {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('tinyint', { name: 'type', comment: '작가 구분' })
  type: number;

  @Column('varchar', { name: 'name', comment: '작가 이름', length: 30 })
  name: string;

  @OneToMany(() => ContentAuthor, (contentAuthors) => contentAuthors.Author)
  ContentAuthors: ContentAuthor[];
}
