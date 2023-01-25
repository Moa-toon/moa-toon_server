import { UpdateDayCode } from 'src/common/types/contents';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Content } from './Content';
import { ContentUpdateDay } from './ContentUpdateDay';

@Entity('updateDay')
export class UpdateDay {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('varchar', { name: 'name', comment: '업데이트 요일 값', length: 8 })
  name: UpdateDayCode;

  @OneToMany(
    () => ContentUpdateDay,
    (contentupdateDays) => contentupdateDays.UpdateDay,
  )
  ContentUpdateDays: ContentUpdateDay[];

  static from(name: UpdateDayCode): UpdateDay {
    const updateDay = new UpdateDay();
    updateDay.name = name;
    return updateDay;
  }
}
