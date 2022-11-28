import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { TransactionEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';
import { Proposal } from '@sputnik-v2/proposal/entities/proposal.entity';

import { BountyClaim } from './bounty-claim.entity';
import { BountyContext } from './bounty-context.entity';

@Entity()
export class Bounty extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  bountyId: number;

  @ApiProperty()
  @Column({ nullable: true, unique: true })
  proposalId: string;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty({ type: Dao })
  @ManyToOne(() => Dao, { eager: true })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @ApiProperty()
  @OneToOne(() => BountyContext, { nullable: true })
  @JoinColumn({ name: 'proposal_id' })
  bountyContext: BountyContext;

  @ApiProperty({ type: () => [Proposal] })
  @OneToMany(() => Proposal, (proposal) => proposal.bounty, {
    nullable: true,
  })
  bountyDoneProposals: Proposal[];

  @ApiProperty({ type: [BountyClaim] })
  @OneToMany(() => BountyClaim, (claim) => claim.bounty, {
    cascade: true,
  })
  bountyClaims: BountyClaim[];

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  token: string;

  @ApiProperty()
  @Column()
  amount: string;

  @ApiProperty()
  @Column()
  times: number;

  @ApiProperty()
  @Column()
  maxDeadline: string;

  @ApiProperty()
  @Column()
  numberOfClaims: number;
}
