import { Column, Entity, ManyToOne } from 'typeorm';
import { Author } from './Author';
import { Content } from './Content';

@Entity('contentAuthor')
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

  static from(content: Content, author: Author): ContentAuthor {
    const contentAuthor = new ContentAuthor();
    contentAuthor.Content = content;
    contentAuthor.Author = author;
    return contentAuthor;
  }
}
