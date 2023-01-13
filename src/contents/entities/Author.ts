import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Author')
export class Author {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('tinyint', { name: 'type', comment: '작가 구분' })
  type: number;

  @Column('varchar', { name: 'name', comment: '작가 이름', length: 30 })
  name: string;
}
