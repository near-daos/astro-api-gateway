import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { Comment } from './comment.entity';

@Entity()
export class CommentReport extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  commentId: number;

  @ManyToOne((_) => Comment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @ApiProperty()
  @Column({ nullable: false })
  accountId: string;

  @ApiProperty()
  @Column({ nullable: false })
  reason: string;
}
