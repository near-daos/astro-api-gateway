import { ApiProperty } from '@nestjs/swagger';
import { AfterLoad, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TransactionEntity } from '@sputnik-v2/common';

import { Bounty } from './bounty.entity';

@Entity()
export class BountyClaim extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ManyToOne(() => Bounty, (bounty) => bounty.bountyClaims)
  bounty: Bounty;

  @ApiProperty()
  @Column()
  accountId: string;

  @ApiProperty()
  @Column()
  startTime: string;

  @ApiProperty()
  @Column()
  deadline: string;

  @ApiProperty()
  @Column()
  completed: boolean;

  @ApiProperty()
  endTime: string;

  @AfterLoad()
  getEndTime() {
    this.endTime = (BigInt(this.startTime) + BigInt(this.deadline)).toString();
  }
}
