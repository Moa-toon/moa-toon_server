import { Column, Entity, ManyToOne } from 'typeorm';
import { Content } from './Content';
import { UpdateDay } from './UpdateDay';

@Entity('contentUpdateDay')
export class ContentUpdateDay {
  @Column('int', { primary: true, name: 'contentIdx' })
  ContentIdx: number;

  @Column('int', { primary: true, name: 'updateDayIdx' })
  UpdateDayIdx: number;

  @ManyToOne(() => Content, (content) => content.ContentUpdateDays, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  Content: Content;

  @ManyToOne(() => UpdateDay, (updateDay) => updateDay.ContentUpdateDays, {
    onDelete: 'CASCADE',
  })
  UpdateDay: UpdateDay;

  static from(content: Content, updateDay: UpdateDay): ContentUpdateDay {
    const contentUpdateDay = new ContentUpdateDay();
    contentUpdateDay.Content = content;
    contentUpdateDay.UpdateDay = updateDay;
    return contentUpdateDay;
  }
}
