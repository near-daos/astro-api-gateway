import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

import { CommentReport } from './comment-report.entity';
import { CommentContextType } from '../types';

@Entity()
export class Comment extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty()
  @Column({ nullable: true })
  proposalId: string;

  @ApiProperty()
  @Column({ nullable: true })
  contextId: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  contextType: CommentContextType;

  @ApiProperty({ type: [CommentReport] })
  @OneToMany(() => CommentReport, (report) => report.comment, {
    cascade: true,
    persistence: false,
    eager: true,
  })
  reports: CommentReport[];

  @ApiProperty()
  @Column({ nullable: false })
  accountId: string;

  @ApiProperty()
  @Column({ nullable: false })
  message: string;
}
