import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { ReceiptAction } from './receipt-action.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'receipts' })
export class Receipt {
  @ApiProperty()
  @PrimaryColumn()
  receiptId: string;

  @ApiProperty()
  @Column()
  predecessorAccountId: string;

  @ApiProperty()
  @Column()
  receiverAccountId: string;

  @ApiProperty()
  @Column()
  originatedFromTransactionHash: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.receipts)
  @JoinColumn({ name: 'originated_from_transaction_hash' })
  originatedFromTransaction: Transaction;

  @ApiProperty()
  @Column({ type: 'bigint' })
  includedInBlockTimestamp: number;

  @ApiProperty({ type: [ReceiptAction] })
  @OneToMany(() => ReceiptAction, (receiptAction) => receiptAction.receipt, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'receipt_id' })
  receiptActions: ReceiptAction[];
}
