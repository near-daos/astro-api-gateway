import {
  AfterLoad,
  Column,
  Entity,
  getManager,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';
import { Vote } from '@sputnik-v2/sputnikdao/types';
import { Comment } from '@sputnik-v2/comment/entities';
import { CommentContextType } from '@sputnik-v2/comment/types';
import { Bounty } from '@sputnik-v2/bounty/entities';

import { ProposalKind, ProposalKindSwaggerDto } from '../dto';
import {
  ProposalStatus,
  ProposalType,
  ProposalVoteStatus,
  ProposalPermissions,
  ProposalPolicyLabel,
} from '../types';
import { ProposalAction } from './proposal-action.entity';

@Entity()
export class Proposal extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  proposalId: number;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty()
  @ManyToOne(() => Dao, { eager: true })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @ApiProperty()
  @Column()
  proposer: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty({
    enum: Object.keys(ProposalStatus),
  })
  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.InProgress,
  })
  status: ProposalStatus;

  @ApiProperty({
    enum: Object.keys(ProposalVoteStatus),
  })
  @Column({
    type: 'enum',
    enum: ProposalVoteStatus,
    nullable: true,
  })
  voteStatus: ProposalVoteStatus;

  @ApiProperty({
    type: ProposalKindSwaggerDto,
  })
  @Column({ type: 'simple-json' })
  kind: ProposalKind;

  @Column({
    type: 'enum',
    enum: ProposalType,
  })
  type: ProposalType;

  @Column({
    type: 'enum',
    enum: ProposalPolicyLabel,
    nullable: true,
  })
  policyLabel: ProposalPolicyLabel;

  @ApiProperty()
  @Column({ type: 'bigint' })
  submissionTime: number;

  @ApiProperty({ type: 'object' })
  @Column({ type: 'simple-json' })
  voteCounts: Record<string, number[]>;

  @ApiProperty({ type: 'object' })
  @Column({ type: 'jsonb' })
  votes: Record<string, Vote>;

  @ApiProperty()
  @Column({ type: 'simple-json', nullable: true })
  failure: Record<string, any>;

  @ApiProperty({ type: [ProposalAction] })
  @OneToMany(() => ProposalAction, (action) => action.proposal, {
    cascade: true,
    persistence: false,
    eager: true,
  })
  actions: ProposalAction[];

  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  votePeriodEnd: number;

  @ApiProperty()
  @Column({ nullable: true })
  bountyDoneId: string;

  @ManyToOne(() => Bounty, (bounty) => bounty.bountyDoneProposals, {
    nullable: true,
  })
  @JoinColumn({ name: 'bounty_done_id' })
  bounty: Bounty;

  @ApiProperty()
  @Column({ nullable: true })
  bountyClaimId: string;

  commentsCount: number;

  @AfterLoad()
  async countComments(): Promise<void> {
    this.commentsCount = await getManager()
      .createQueryBuilder(Comment, 'comment')
      .where({
        contextId: this.id,
        contextType: CommentContextType.Proposal,
        isArchived: false,
      })
      .getCount();
  }

  @ApiProperty()
  permissions?: ProposalPermissions;
}
