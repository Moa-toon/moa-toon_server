import { Webtoon } from 'src/common/types/contents';
import { getUniqueIdxByPlatform } from 'src/common/utils/getUniqueIdxByPlatform';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentAuthor } from './ContentAuthor';
import { ContentGenre } from './ContentGenre';
import { ContentUpdateDay } from './ContentUpdateDay';
import { Episode } from './Episode';
import { Platform } from './Platform';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('varchar', {
    name: 'uuid',
    comment: '각 플랫폼으로부터 부여받은 콘텐츠 고유번호',
    length: 20,
    default: '',
    unique: true,
  })
  uuid: string;

  @Column('tinyint', {
    name: 'type',
    comment: '콘텐츠 타입(0: 웹툰, 1: 웹소설)',
    default: 0,
  })
  type: number;

  @Column('varchar', {
    name: 'title',
    comment: '제목',
    length: 100,
    default: '',
  })
  title: string;

  @Column('varchar', {
    name: 'summary',
    comment: '줄거리 요약',
    length: 200,
    nullable: true,
  })
  summary: string;

  @Column('text', { name: 'description', comment: '줄거리', nullable: true })
  description: string;

  @Column('tinyint', { name: 'ageLimit', comment: '나이 제한', default: 0 })
  ageLimit: number;

  @Column('varchar', {
    name: 'urlOfPc',
    comment: 'PC 버전 url',
    length: 255,
    nullable: true,
  })
  urlOfPc: string;

  @Column('varchar', {
    name: 'urlOfMobile',
    comment: 'Mobile 버전 url',
    length: 255,
    nullable: true,
  })
  urlOfMobile: string;

  @Column('varchar', {
    name: 'thumbnailPath',
    comment: '썸네일 이미지 경로',
    length: 255,
    nullable: true,
  })
  thumbnailPath: string;

  @Column('boolean', {
    name: 'isNew',
    comment: '신규 콘텐츠 여부',
    default: false,
  })
  isNew: boolean;

  @Column('boolean', {
    name: 'isAdult',
    comment: '성인 콘텐츠 여부',
    default: false,
  })
  isAdult: boolean;

  @Column('boolean', {
    name: 'isPaused',
    comment: '콘텐츠 휴재 여부',
    default: false,
  })
  isPaused: boolean;

  @Column('boolean', {
    name: 'isUpdated',
    comment: '콘텐츠 업데이트 여부',
    default: false,
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

  @ManyToOne(() => Platform, (platform) => platform.Contents, {
    onDelete: 'CASCADE',
  })
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

  @OneToMany(() => Episode, (episodes) => episodes.Content)
  Episodes: Episode[];

  static from(content: Webtoon, platform: Platform): Content {
    const contentEntity = new Content();
    contentEntity.type = content.type;
    contentEntity.uuid = `${getUniqueIdxByPlatform(platform.name)}${
      content.id
    }`;
    contentEntity.title = content.title;
    contentEntity.summary = content.summary;
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
