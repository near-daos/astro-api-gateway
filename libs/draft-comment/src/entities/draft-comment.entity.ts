import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { DraftCommentContextType } from '../types';

@Entity()
export class DraftComment extends BaseEntity {
  @ObjectIdColumn({ unique: true })
  id: string;

  @Column({ nullable: false })
  contextId: string;

  @Column({
    type: 'enum',
    enum: DraftCommentContextType,
  })
  contextType: DraftCommentContextType;

  @Column({ nullable: false })
  author: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: true })
  replyTo: string;

  @Column()
  likeAccounts: string[];
}
