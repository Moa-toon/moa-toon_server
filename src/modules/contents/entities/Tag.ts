import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentTag } from './ContentTag';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('varchar', { name: 'name', comment: '태그 이름', length: 30 })
  name: string;

  @OneToMany(() => ContentTag, (contentTags) => contentTags.Tag)
  ContentTags: ContentTag[];

  static from(name: string): Tag {
    const genre = new Tag();
    genre.name = name;
    return genre;
  }
}
