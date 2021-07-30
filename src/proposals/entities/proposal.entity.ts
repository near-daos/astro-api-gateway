import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Dao } from 'src/daos/entities/dao.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
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
export class Proposal {

  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @ManyToOne(_ => Dao)
  @JoinColumn({ name: "dao_id" })
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
    type: "enum",
    enum: ProposalStatus,
    default: ProposalStatus.Vote
  })
  status: ProposalStatus;

  //TODO: type
  @ApiProperty()
  @Column({ type: "simple-json" })
  kind: ProposalKind;

  @ApiProperty()
  @Column({ type: 'timestamptz' })
  votePeriodEnd: Date;

  @ApiProperty()
  @Column()
  voteYes: number;

  @ApiProperty()
  @Column()
  voteNo: number;

  @ApiProperty()
  @Column("simple-json")
  votes: {}

  @Exclude()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
