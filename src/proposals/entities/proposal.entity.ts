import { Exclude } from 'class-transformer';
import { Dao } from 'src/daos/entities/dao.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
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
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ManyToOne(_ => Dao)
  @JoinColumn({ name: "dao_id" })
  dao: Dao;

  @Column()
  target: string;

  @Column()
  proposer: string;

  @Column()
  description: string;

  @Column({
    type: "enum",
    enum: ProposalStatus,
    default: ProposalStatus.Vote
  })
  status: ProposalStatus;

  //TODO: type
  @Column({ type: "simple-json" })
  kind: ProposalKind;

  @Column({ type: 'timestamptz' })
  votePeriodEnd: Date;

  @Column()
  voteYes: number;

  @Column()
  voteNo: number;

  @Column("simple-json")
  votes: {}

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
