import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('platform')
export class Platform {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('varchar', { name: 'name', comment: '플랫폼 이름', length: 30 })
  name: 'naver' | 'kakao' | 'kakaoPage';
}
