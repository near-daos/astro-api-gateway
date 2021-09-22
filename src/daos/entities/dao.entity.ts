import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from 'src/common/transaction.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { DaoConfig } from '../types/dao-config';
import { DaoStatus } from '../types/dao-status';
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

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    enum: Object.keys(DaoStatus),
  })
  @Column({
    type: 'enum',
    enum: DaoStatus,
    nullable: true,
  })
  status: DaoStatus;
}
