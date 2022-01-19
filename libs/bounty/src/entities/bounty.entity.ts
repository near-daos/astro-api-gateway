import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { TransactionEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';

import { BountyClaim } from './bounty-claim.entity';

@Entity()
export class Bounty extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  bountyId: number;

  @ApiProperty()
  @Column({ nullable: true })
  proposalId: string;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty({ type: Dao })
  @ManyToOne(() => Dao, { eager: true })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

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
  times: string;

  @ApiProperty()
  @Column()
  maxDeadline: string;

  @ApiProperty()
  @Column()
  numberOfClaims: number;
}
