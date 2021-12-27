import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { TransactionEntity } from '@sputnik-v2/common';

import { DaoConfig } from '../types/dao-config';
import { Policy } from './policy.entity';

@Entity()
export class Dao extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty({ type: DaoConfig })
  @Column({ type: 'simple-json' })
  config: DaoConfig;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  metadata: string;

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
    description: 'List of accounts that can vote for various activity',
  })
  @Column({ type: 'text', array: true })
  council: string[];

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
}
