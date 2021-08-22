import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity({ name: 'receipts' })
export class Receipt {
  @PrimaryColumn()
  receiptId: string;

  @Column()
  predecessorAccountId: string;

  @Column()
  receiverAccountId: string;

  @Column()
  originatedFromTransactionHash: string;

  @OneToOne((_) => Transaction)
  @JoinColumn({ name: 'originated_from_transaction_hash' })
  originatedFromTransaction: Transaction;
}
