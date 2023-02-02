import { WebtoonEpisodeInfo } from 'src/common/types/contents';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Content } from './Content';

@Entity('episode')
export class Episode {
  @Column('int', {
    primary: true,
    name: 'contentIdx',
    comment: '콘텐츠 인덱스 번호',
  })
  ContentIdx: number;

  @Column('int', {
    primary: true,
    name: 'order',
    comment: '에피소드 회차',
    default: 0,
  })
  order: number;

  @Column('varchar', { name: 'title', comment: '제목', length: 100 })
  title: string;

  @Column('varchar', {
    name: 'urlOfPc',
    comment: 'PC버전 페이지 url',
    length: 255,
  })
  urlOfPc: string;

  @Column('varchar', {
    name: 'urlOfMobile',
    comment: 'Mobile버전 페이지 url',
    length: 255,
  })
  urlOfMobile: string;

  @Column('varchar', {
    name: 'thumbnailUrl',
    comment: '썸네일 이미지 경로',
    length: 255,
  })
  thumbnailUrl: string;

  @Column('boolean', {
    name: 'isFree',
    comment: '무료 여부',
  })
  isFree: boolean;

  @Column('datetime', {
    name: 'createdAt',
    comment: '연재일',
    nullable: true,
  })
  createdAt: Date | null;

  @ManyToOne(() => Content, (content) => content.Episodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contentIdx', referencedColumnName: 'idx' })
  Content: Content;

  static from(contentIdx: number, episodeInfo: WebtoonEpisodeInfo): Episode {
    const episode = new Episode();
    episode.ContentIdx = contentIdx;
    episode.order = episodeInfo.order;
    episode.title = episodeInfo.title;
    episode.urlOfPc = episodeInfo.urlOfPc;
    episode.urlOfMobile = episodeInfo.urlOfMobile;
    episode.thumbnailUrl = episodeInfo.thumbnailUrl;
    episode.isFree = episodeInfo.isFree;
    episode.createdAt =
      episodeInfo.createDate !== ''
        ? new Date(`20${episodeInfo.createDate}`)
        : new Date(Date.now());
    return episode;
  }
}
