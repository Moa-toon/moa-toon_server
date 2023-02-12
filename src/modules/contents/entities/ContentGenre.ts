import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Content } from './Content';
import { Genre } from './Genre';

@Entity('contentGenre')
@Unique('unique_content_genre_constraint', ['ContentIdx', 'GenreIdx'])
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

  static from(contentIdx: number, genre: Genre): ContentGenre {
    const contentGenre = new ContentGenre();
    contentGenre.ContentIdx = contentIdx;
    contentGenre.Genre = genre;
    return contentGenre;
  }
}
