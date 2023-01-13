import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Content } from './Content';
import { ContentUpdateDay } from './ContentUpdateDay';

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

  @OneToMany(
    () => ContentUpdateDay,
    (contentupdateDays) => contentupdateDays.UpdateDay,
  )
  ContentUpdateDays: ContentUpdateDay[];
}
