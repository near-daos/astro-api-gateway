import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { DaoStatus } from '../types/dao-status';
import { Policy } from './policy.entity';

@Entity()
export class Dao extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  metadata: string;

  @ApiProperty()
  @Column()
  amount: string;

  @ApiProperty()
  @Column()
  totalSupply: string;

  @ApiProperty()
  @Column()
  purpose: string;

  @ApiProperty()
  @Column()
  lastBountyId: number;

  @ApiProperty()
  @Column()
  lastProposalId: number;

  @ApiProperty()
  @Column()
  numberOfProposals: number;

  @ApiProperty()
  @Column()
  stakingContract: string;

  @ApiProperty()
  @Column({ nullable: true })
  numberOfMembers: number;

  @ApiProperty()
  @Column({ type: 'text', array: true })
  council: string[];

  @ApiProperty()
  @Column()
  councilSeats: number;

  @ApiProperty()
  @OneToOne((_) => Policy, { eager: true, cascade: true })
  @JoinColumn({ name: 'id' })
  policy: Policy;

  @ApiProperty()
  @Column({ nullable: true })
  transactionHash: string;

  @ApiProperty()
  @Column({ nullable: true })
  updateTransactionHash: string;

  @Column({ type: 'bigint', nullable: true })
  createTimestamp: number;
  
  @Column({ type: 'bigint', nullable: true })
  updateTimestamp: number;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: DaoStatus,
    nullable: true,
  })
  status: DaoStatus;
}
