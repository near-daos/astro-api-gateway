import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';
import { ActionKind } from '../types/action-kind';

@Entity({ name: 'transaction_actions' })
export class TransactionAction {

  @PrimaryColumn()
  transactionHash: string;

  @Column()
  indexInTransaction: number;

  @Column({
    type: "enum",
    enum: ActionKind
  })
  actionKind: string;

  @Column({ type: "simple-json" })
  args: string;
}
