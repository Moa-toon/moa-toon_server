import { Column, Entity, ManyToOne } from 'typeorm';
import { Content } from './Content';
import { Genre } from './Genre';

@Entity('contentGenre')
export class ContentGenre {
  @Column('int', { primary: true, name: 'genreIdx' })
  GenreIdx: number;

  @Column('int', { primary: true, name: 'contentIdx' })
  ContentIdx: number;

  @ManyToOne(() => Genre, (genre) => genre.ContentGenres)
  Genre: Genre;

  @ManyToOne(() => Content, (content) => content.ContentGenres)
  Content: Content;
}
