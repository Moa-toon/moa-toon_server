import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('genre')
export class Genre {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('int', {
    name: 'parentIdx',
    comment: '부모 인덱스',
    default: 0,
  })
  parentIdx: number;

  @Column('varchar', { name: 'name', comment: '장르 이름', length: 30 })
  name: string;
}
