import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Content } from './Content';
import { Tag } from './Tag';

@Entity('contentTag')
@Unique('unique_content_tag_constraint', ['ContentIdx', 'TagIdx'])
export class ContentTag {
  @Column('int', { primary: true, name: 'contentIdx' })
  ContentIdx: number;

  @Column('int', { primary: true, name: 'tagIdx' })
  TagIdx: number;

  @ManyToOne(() => Content, (content) => content.ContentTags, {
    onDelete: 'CASCADE',
  })
  Content: Content;

  @ManyToOne(() => Tag, (tag) => tag.ContentTags, { onDelete: 'CASCADE' })
  Tag: Tag;

  static from(contentIdx: number, tag: Tag): ContentTag {
    const contentTag = new ContentTag();
    contentTag.ContentIdx = contentIdx;
    contentTag.Tag = tag;
    return contentTag;
  }
}
