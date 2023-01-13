import { Column, Entity, ManyToOne } from 'typeorm';
import { Content } from './Content';
import { UpdateDay } from './UpdateDay';

@Entity('contentUpdateDay')
export class ContentUpdateDay {
  @Column('int', { primary: true, name: 'contentIdx' })
  ContentIdx: number;

  @Column('int', { primary: true, name: 'updateDayIdx' })
  UpdateDayIdx: number;

  @ManyToOne(() => Content, (content) => content.ContentUpdateDays)
  Content: Content;

  @ManyToOne(() => UpdateDay, (updateDay) => updateDay.ContentUpdateDays)
  UpdateDay: UpdateDay;
}
