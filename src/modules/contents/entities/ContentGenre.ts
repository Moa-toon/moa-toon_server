import { Column, Entity, ManyToOne } from 'typeorm';
import { Content } from './Content';
import { Genre } from './Genre';

@Entity('contentGenre')
export class ContentGenre {
  @Column('int', { primary: true, name: 'genreIdx' })
  GenreIdx: number;

  @Column('int', { primary: true, name: 'contentIdx' })
  ContentIdx: number;

  @ManyToOne(() => Genre, (genre) => genre.ContentGenres, {
    onDelete: 'CASCADE',
  })
  Genre: Genre;

  @ManyToOne(() => Content, (content) => content.ContentGenres, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  Content: Content;

  static from(content: Content, genre: Genre): ContentGenre {
    const contentGenre = new ContentGenre();
    contentGenre.Content = content;
    contentGenre.Genre = genre;
    return contentGenre;
  }
}
