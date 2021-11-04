import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'account_changes' })
export class AccountChange {
  @ApiProperty()
  @PrimaryColumn()
  id: string;

  @Column()
  affectedAccountId: string;

  @Column({ nullable: true })
  causedByTransactionHash: string;

  @Column({ type: 'bigint' })
  changedInBlockTimestamp: number;
}
