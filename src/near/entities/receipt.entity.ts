import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ReceiptAction } from './receipt-action.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'receipts' })
export class Receipt {
  @PrimaryColumn()
  receiptId: string;

  @Column()
  predecessorAccountId: string;

  @Column()
  receiverAccountId: string;

  @ManyToOne((_) => Transaction, (transaction) => transaction.receipts)
  @JoinColumn({ name: 'originated_from_transaction_hash' })
  originatedFromTransaction: Transaction;

  @Column({ type: 'bigint' })
  includedInBlockTimestamp: number;

  @OneToOne((_) => ReceiptAction, (receiptAction) => receiptAction.receipt, {
    cascade: true,
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'receipt_id' })
  receiptAction: ReceiptAction;
}
