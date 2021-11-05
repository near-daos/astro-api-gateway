import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';
import { Vote } from '@sputnik-v2/sputnikdao/types';

import { ProposalKind } from '../dto/proposal-kind.dto';
import { ProposalKindSwaggerDto } from '../dto/proposal-kind-swagger.dto';
import { ProposalStatus } from '../types/proposal-status';
import { ProposalVoteStatus } from '../types/proposal-vote-status';

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
  @ManyToOne((_) => Dao, { eager: true })
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

  @ApiProperty()
  @Column({ type: 'bigint' })
  submissionTime: number;

  @ApiProperty({ type: 'object' })
  @Column({ type: 'simple-json' })
  voteCounts: Record<string, number[]>;

  @ApiProperty({ type: 'object' })
  @Column({ type: 'simple-json' })
  votes: Record<string, Vote>;

  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  votePeriodEnd: number;
}
