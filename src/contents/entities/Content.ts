import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('varchar', { name: 'urlOfPc', comment: 'PC 버전 url', length: 100 })
  urlOfPc: string;

  @Column('varchar', {
    name: 'urlOfMobile',
    comment: 'Mobile 버전 url',
    length: 100,
  })
  urlOfMobile: string;

  @Column('varchar', {
    name: 'thumbnailPath',
    comment: '썸네일 이미지 경로',
    length: 100,
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
    name: 'createdAt',
    comment: '연재 시작일',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  createdAt: Date;

  @Column('datetime', {
    name: 'finishedAt',
    nullable: true,
    comment: '연재 종료일',
  })
  finishedAt: Date | null;
}
