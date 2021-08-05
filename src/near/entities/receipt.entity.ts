import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';

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
}
