import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { ExecutionOutcomeStatus } from '../types/execution-outcome-status';
import { Receipt } from './receipt.entity';
import { TransactionAction } from './transaction-action.entity';

@Entity({ name: 'transactions' })
export class Transaction {
  @ApiProperty()
  @PrimaryColumn()
  transactionHash: string;

  @Column()
  includedInBlockHash: string;

  @Column()
  includedInChunkHash: string;

  @Column()
  indexInChunk: number;

  @ApiProperty()
  @OneToOne((_) => TransactionAction, { cascade: true })
  @JoinColumn({ name: 'transaction_hash' })
  transactionAction: TransactionAction;

  @ApiProperty({ type: [Receipt] })
  @OneToMany(() => Receipt, (receipt) => receipt.originatedFromTransaction, {
    cascade: true,
  })
  receipts: Receipt[];

  @ApiProperty()
  @Column()
  receiverAccountId: string;

  @ApiProperty()
  @Column()
  signerAccountId: string;

  @Column()
  signerPublicKey: string;

  @Column({ type: 'bigint' })
  nonce: number;

  @Column()
  signature: string;

  @ApiProperty({
    enum: Object.keys(ExecutionOutcomeStatus),
  })
  @Column({
    type: 'enum',
    enum: ExecutionOutcomeStatus,
  })
  status: string;

  @Column()
  convertedIntoReceiptId: string;

  @ApiProperty()
  @Column()
  receiptConversionGasBurnt: string;

  @ApiProperty()
  @Column()
  receiptConversionTokensBurnt: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  blockTimestamp: number;
}
