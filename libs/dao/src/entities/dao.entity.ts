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
import { DaoVersion } from '@sputnik-v2/dao/entities/dao-version.entity';

import { DaoConfig, DaoStatus } from '../types';
import { Policy } from './policy.entity';
import { Delegation } from './delegation.entity';

@Entity()
export class Dao extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty({ type: DaoConfig })
  @Column({ type: 'jsonb' })
  config: DaoConfig;

  @ApiProperty()
  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'numeric' })
  amount: number;

  @ApiProperty()
  @Column()
  totalSupply: string;

  @ApiProperty()
  @Column()
  lastBountyId: number;

  @ApiProperty()
  @Column()
  lastProposalId: number;

  @ApiProperty()
  @Column()
  stakingContract: string;

  @ApiProperty({
    description:
      'How many accounts in total have interacted with the DAO (made proposals, voted, etc).',
  })
  @Column({ nullable: true })
  numberOfAssociates: number;

  @ApiProperty({
    description: 'How many accounts are members of the DAO',
  })
  @Column({ nullable: true })
  numberOfMembers: number;

  @ApiProperty({
    description: 'How many groups exist in the DAO',
  })
  @Column({ nullable: true })
  numberOfGroups: number;

  @ApiProperty({
    description: 'List of accounts that can vote for various activity',
  })
  @Column({ type: 'text', array: true })
  council: string[];

  @ApiProperty({
    description: 'List of all account ids that joined the DAO',
  })
  @Column({ type: 'text', array: true, nullable: true })
  accountIds: string[];

  @ApiProperty({
    description: 'Council accounts count',
  })
  @Column()
  councilSeats: number;

  @ApiProperty()
  @OneToOne(() => Policy, { eager: true, cascade: true })
  @JoinColumn({ name: 'id' })
  policy: Policy;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @Column({ nullable: true })
  createdBy: string;

  @ApiProperty()
  @Column({ nullable: true })
  daoVersionHash: string;

  @ApiProperty()
  @ManyToOne(() => DaoVersion, { eager: true, nullable: true })
  @JoinColumn({ name: 'dao_version_hash' })
  daoVersion: DaoVersion;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  status: DaoStatus;

  @ApiProperty()
  @Column({ default: 0 })
  activeProposalCount: number;

  @ApiProperty()
  @Column({ default: 0 })
  totalProposalCount: number;

  @ApiProperty()
  @Column({ type: 'float', default: 0 })
  totalDaoFunds: number;

  @ApiProperty()
  @Column({ default: 0 })
  bountyCount: number;

  @ApiProperty()
  @Column({ default: 0 })
  nftCount: number;

  @OneToMany(() => Delegation, (delegation) => delegation.dao, {
    eager: false,
    nullable: true,
    persistence: false,
  })
  delegations?: Delegation[];
}
