import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { Receipt } from './receipt.entity';

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryColumn()
  id: number;

  @Column()
  accountId: string;

  @Column()
  createdByReceiptId: string;

  @OneToOne(() => Receipt)
  @JoinColumn({ name: 'created_by_receipt_id' })
  receipt: Receipt;

  @Column()
  deletedByReceiptId: string;

  @Column()
  lastUpdateBlockHeight: number;
}
