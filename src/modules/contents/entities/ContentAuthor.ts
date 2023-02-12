import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Author } from './Author';
import { Content } from './Content';

@Entity('contentAuthor')
@Unique('unique_content_author_constraint', ['ContentIdx', 'AuthorIdx'])
export class ContentAuthor {
  @Column('int', { primary: true, name: 'contentIdx' })
  ContentIdx: number;

  @Column('int', { primary: true, name: 'authorIdx' })
  AuthorIdx: number;

  @ManyToOne(() => Content, (content) => content.ContentAuthors, {
    onDelete: 'CASCADE',
  })
  Content: Content;

  @ManyToOne(() => Author, (author) => author.ContentAuthors, {
    onDelete: 'CASCADE',
  })
  Author: Author;

  static from(contentIdx: number, author: Author): ContentAuthor {
    const contentAuthor = new ContentAuthor();
    contentAuthor.ContentIdx = contentIdx;
    contentAuthor.Author = author;
    return contentAuthor;
  }
}
