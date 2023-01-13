import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('updateDay')
export class UpdateDay {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('varchar', { name: 'name', comment: '업데이트 요일 값', length: 8 })
  name:
    | 'mon'
    | 'tue'
    | 'wed'
    | 'thu'
    | 'fri'
    | 'sat'
    | 'sun'
    | 'daily'
    | 'finished';
}
