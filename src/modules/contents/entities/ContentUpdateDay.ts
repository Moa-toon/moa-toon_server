import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Content } from './Content';
import { UpdateDay } from './UpdateDay';

@Entity('contentUpdateDay')
@Unique('unique_content_update_day_constraint', ['ContentIdx', 'UpdateDayIdx'])
export class ContentUpdateDay {
  @Column('int', { primary: true, name: 'contentIdx' })
  ContentIdx: number;

  @Column('int', { primary: true, name: 'updateDayIdx' })
  UpdateDayIdx: number;

  @ManyToOne(() => Content, (content) => content.ContentUpdateDays, {
    onDelete: 'CASCADE',
  })
  Content: Content;

  @ManyToOne(() => UpdateDay, (updateDay) => updateDay.ContentUpdateDays, {
    onDelete: 'CASCADE',
  })
  UpdateDay: UpdateDay;

  static from(contentIdx: number, updateDay: UpdateDay): ContentUpdateDay {
    const contentUpdateDay = new ContentUpdateDay();
    contentUpdateDay.ContentIdx = contentIdx;
    contentUpdateDay.UpdateDay = updateDay;
    return contentUpdateDay;
  }
}
