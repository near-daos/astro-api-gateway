import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Receipt } from '@sputnik-v2/near-indexer/entities/receipt.entity';

@Entity({ name: 'account_changes' })
export class AccountChange {
  @ApiProperty()
  @PrimaryColumn()
  id: string;

  @Column()
  affectedAccountId: string;

  @Column({ nullable: true })
  causedByTransactionHash: string;

  @Column({ type: 'bigint' })
  changedInBlockTimestamp: number;

  @ApiProperty()
  @OneToOne(() => Receipt, { cascade: true })
  @JoinColumn({ name: 'caused_by_receipt_id' })
  causedByReceipt: Receipt;
}
