import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from 'src/common/transaction.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
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
}
