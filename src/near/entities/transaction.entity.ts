import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';

@Entity({ name: 'transactions' })
export class Transaction {

  @PrimaryColumn()
  transactionHash: string;

  @Column()
  receiverAccountId: string;
}
