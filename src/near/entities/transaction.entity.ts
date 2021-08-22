import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ExecutionOutcomeStatus } from '../types/execution-outcome-status';
import { TransactionAction } from './transaction-action.entity';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryColumn()
  transactionHash: string;

  @Column()
  includedInBlockHash: string;

  @Column()
  includedInChunkHash: string;

  @Column()
  indexInChunk: number;

  @OneToOne((_) => TransactionAction, { cascade: true })
  @JoinColumn({ name: 'transaction_hash' })
  transactionAction: TransactionAction;

  @Column()
  receiverAccountId: string;

  @Column()
  signerAccountId: string;

  @Column()
  signerPublicKey: string;

  @Column({ type: 'bigint' })
  nonce: number;

  @Column()
  signature: string;

  @Column({
    type: 'enum',
    enum: ExecutionOutcomeStatus,
  })
  status: string;

  @Column()
  convertedIntoReceiptId: string;

  @Column()
  receiptConversionGasBurnt: string;

  @Column()
  receiptConversionTokensBurnt: string;

  @Column({ type: 'bigint' })
  blockTimestamp: number;
}
