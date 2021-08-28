import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common';
import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { DaoStatus } from '../types/dao-status';

@Entity()
export class Dao extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  amount: string;

  @ApiProperty()
  @Column()
  bond: string;

  @ApiProperty()
  @Column()
  purpose: string;

  @ApiProperty()
  @Column()
  votePeriod: string;

  @ApiProperty()
  @Column('text', { array: true, nullable: true })
  council: string[];

  @ApiProperty()
  @Column()
  numberOfProposals: number;

  @ApiProperty()
  @Column({ nullable: true })
  councilSeats: number;

  @ApiProperty()
  @Column({ nullable: true })
  numberOfMembers: number;

  @ApiProperty()
  @Column({ nullable: true })
  transactionHash: string;

  @Column({ type: 'bigint', nullable: true })
  createTimestamp: number;

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
