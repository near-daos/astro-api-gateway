import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common';
import { Dao } from 'src/daos/entities/dao.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ProposalStatus } from '../types/proposal-status';
import { ProposalType } from '../types/proposal-type';

export type ProposalKind =
  | {
      type: ProposalType.Payout;
      amount: string;
    }
  | {
      type: ProposalType.ChangeVotePeriod;
      votePeriod: string;
    }
  | {
      type: ProposalType.NewCouncil;
    }
  | {
      type: ProposalType.RemoveCouncil;
    }
  | {
      type: ProposalType.ChangePurpose;
      purpose: string;
    };

@Entity()
export class Proposal extends BaseEntity {
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
  target: string;

  @ApiProperty()
  @Column()
  proposer: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.Vote,
  })
  status: ProposalStatus;

  //TODO: type
  @ApiProperty()
  @Column({ type: 'simple-json' })
  kind: ProposalKind;

  @ApiProperty()
  @Column({ type: 'bigint' })
  votePeriodEnd: number;

  @ApiProperty()
  @Column()
  voteYes: number;

  @ApiProperty()
  @Column()
  voteNo: number;

  @ApiProperty()
  @Column('simple-json')
  votes: Record<string, unknown>;

  @ApiProperty()
  @Column({ nullable: true })
  txHash: string;

  @Column({ type: 'bigint', nullable: true })
  txTimestamp: number;
}
