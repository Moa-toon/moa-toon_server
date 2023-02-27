import { WebtoonEpisodeInfo } from 'src/common/types/contents';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Content } from './Content';

@Entity('episode')
@Unique('unique_content_episode_constraint', ['ContentIdx', 'order'])
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

  private static convertCreateDate(createDate: string): Date {
    const regexOfNaver = /^([0-2]\d|3[0-1])\.(0[1-9]|1[0-2])\.(\d{2})$/;
    const regexOfKakaoWebtoon =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
    if (regexOfNaver.test(createDate)) return new Date(`20${createDate}`);
    else if (regexOfKakaoWebtoon.test(createDate)) return new Date(createDate);
  }

  static from(contentIdx: number, episodeInfo: WebtoonEpisodeInfo): Episode {
    const episode = new Episode();
    episode.ContentIdx = contentIdx;
    episode.order = episodeInfo.order;
    episode.title = episodeInfo.title;
    episode.urlOfPc = episodeInfo.urlOfPc;
    episode.urlOfMobile = episodeInfo.urlOfMobile;
    episode.thumbnailUrl = episodeInfo.thumbnailUrl;
    episode.isFree = episodeInfo.isFree;
    // kakao: 2022-09-11T13:00:00Z
    // naver: 21.06.27
    console.log(episodeInfo.createDate);
    episode.createdAt = this.convertCreateDate(episodeInfo.createDate);
    return episode;
  }
}
