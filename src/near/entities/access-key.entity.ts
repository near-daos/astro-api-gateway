import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';

@Entity({ name: 'access_keys' })
export class AccessKey {

  @PrimaryColumn()
  publicKey: string;

  @Column()
  accountId: string;

  @Column()
  createdByReceiptId: string;

  @Column()
  deletedByReceiptId: string;

  @Column()
  lastUpdateBlockHeight: number;
}
