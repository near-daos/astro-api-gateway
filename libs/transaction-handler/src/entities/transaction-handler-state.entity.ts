import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TransactionHandlerStatus } from '../types/transaction-handler-status';

@Entity()
export class TransactionHandlerState {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  lastBlockTimestamp: number;

  @ApiProperty()
  @Column()
  lastBlockHash: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: TransactionHandlerStatus,
    default: TransactionHandlerStatus.InProgress,
  })
  status: TransactionHandlerStatus;
}
