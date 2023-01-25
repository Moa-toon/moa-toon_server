import { PlatformType } from 'src/common/types/contents';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Content } from './Content';

@Entity('platform')
export class Platform {
  @PrimaryGeneratedColumn({ type: 'int', name: 'idx', comment: '인덱스' })
  idx: number;

  @Column('varchar', { name: 'name', comment: '플랫폼 이름', length: 30 })
  name: PlatformType;

  @OneToMany(() => Content, (content) => content.Platform)
  Contents: Content[];
}
