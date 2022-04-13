import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

@Entity()
export class DaoVersion extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  hash: string;

  @ApiProperty()
  @Column()
  version: string;

  @ApiProperty()
  @Column()
  commitId: string;

  @ApiProperty()
  @Column({ nullable: true })
  changelogUrl: string;
}
