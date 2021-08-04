import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';

@Entity({ name: 'accounts' })
export class Account {

  @PrimaryColumn()
  id: number;

  @Column()
  accountId: string;

  @Column()
  createdByReceiptId: string;

  @Column()
  deletedByReceiptId: string;

  @Column()
  lastUpdateBlockHeight: number;
}
