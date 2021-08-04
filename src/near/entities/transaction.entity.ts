import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn
} from 'typeorm';
import { TransactionAction } from './transaction-action.entity';

@Entity({ name: 'transactions' })
export class Transaction {

  @PrimaryColumn()
  transactionHash: string;

  @OneToOne(_ => TransactionAction)
  @JoinColumn({ name: "transaction_hash" })
  transactionAction: TransactionAction;

  @Column()
  receiverAccountId: string;

  @Column()
  blockTimestamp: number;
}
