import { Webtoon } from 'src/common/types/contents';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentAuthor } from './ContentAuthor';
import { ContentGenre } from './ContentGenre';
import { ContentUpdateDay } from './ContentUpdateDay';
import { Platform } from './Platform';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('varchar', { name: 'title', comment: '제목', length: 100 })
  title: string;

  @Column('text', { name: 'description', comment: '줄거리' })
  description: string;

  @Column('tinyint', { name: 'ageLimit', comment: '나이 제한' })
  ageLimit: number;

  @Column('varchar', {
    name: 'urlOfPc',
    comment: 'PC 버전 url',
    length: 100,
    nullable: true,
  })
  urlOfPc: string;

  @Column('varchar', {
    name: 'urlOfMobile',
    comment: 'Mobile 버전 url',
    length: 100,
    nullable: true,
  })
  urlOfMobile: string;

  @Column('varchar', {
    name: 'thumbnailPath',
    comment: '썸네일 이미지 경로',
    length: 255,
  })
  thumbnailPath: string;

  @Column('boolean', {
    name: 'isNew',
    comment: '신규 콘텐츠 여부',
  })
  isNew: boolean;

  @Column('boolean', {
    name: 'isAdult',
    comment: '성인 콘텐츠 여부',
  })
  isAdult: boolean;

  @Column('boolean', {
    name: 'isPaused',
    comment: '콘텐츠 휴재 여부',
  })
  isPaused: boolean;

  @Column('boolean', {
    name: 'isUpdated',
    comment: '콘텐츠 업데이트 여부',
  })
  isUpdated: boolean;

  @Column('datetime', {
    name: 'startedAt',
    comment: '연재 시작일',
    default: () => 'CURRENT_TIMESTAMP',
  })
  startedAt: Date;

  @Column('datetime', {
    name: 'finishedAt',
    nullable: true,
    comment: '연재 종료일',
  })
  finishedAt: Date | null;

  @ManyToOne(() => Platform, (platform) => platform.Contents)
  @JoinColumn({ name: 'platformIdx', referencedColumnName: 'idx' })
  Platform: Platform;

  @OneToMany(() => ContentGenre, (contentGenres) => contentGenres.Content)
  ContentGenres: ContentGenre[];

  @OneToMany(() => ContentAuthor, (contentAuthors) => contentAuthors.Content)
  ContentAuthors: ContentAuthor[];

  @OneToMany(
    () => ContentUpdateDay,
    (contentUpdateDays) => contentUpdateDays.Content,
  )
  ContentUpdateDays: ContentUpdateDay[];

  static from(content: Webtoon, platform: Platform): Content {
    const contentEntity = new Content();
    contentEntity.idx = parseInt(content.id);
    contentEntity.title = content.title;
    contentEntity.description = content.description;
    contentEntity.urlOfMobile = content.url;
    contentEntity.isAdult = content.additional.isAdult;
    contentEntity.isNew = content.additional.isNew;
    contentEntity.isPaused = content.additional.isPaused;
    contentEntity.isUpdated = content.additional.isUpdated;
    contentEntity.thumbnailPath = content.thumbnailPath;
    contentEntity.ageLimit = content.ageLimit;
    contentEntity.startedAt =
      content.episodes.length > 0
        ? new Date(`20${content.episodes[0].createDate}`)
        : new Date(Date.now());
    contentEntity.Platform = platform;
    return contentEntity;
  }
}
