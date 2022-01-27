import { ApiProperty } from '@nestjs/swagger';
import {
  AfterLoad,
  Column,
  Entity,
  getManager,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { Proposal } from '@sputnik-v2/proposal/entities/proposal.entity';
import { Comment } from '@sputnik-v2/comment/entities';
import { CommentContextType } from '@sputnik-v2/comment/types';

import { Bounty } from './bounty.entity';

@Entity()
export class BountyContext extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  daoId: string;

  @OneToOne(() => Proposal)
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  proposal: Proposal;

  @ApiProperty()
  @OneToOne(() => Bounty, (bounty) => bounty.bountyContext, { nullable: true })
  bounty: Bounty;

  commentsCount: number;

  @AfterLoad()
  async countComments(): Promise<void> {
    this.commentsCount = await getManager()
      .createQueryBuilder(Comment, 'comment')
      .where({
        contextId: this.id,
        contextType: CommentContextType.BountyContext,
        isArchived: false,
      })
      .getCount();
  }
}
