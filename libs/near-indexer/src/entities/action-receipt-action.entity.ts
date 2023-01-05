import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Receipt } from './receipt.entity';
import { Transaction } from './transaction.entity';
import { ActionKind } from '../types/action-kind';

@Entity({ name: 'action_receipt_actions' })
export class ActionReceiptAction {
  @ApiProperty()
  @PrimaryColumn()
  receiptId: string;

  @ApiProperty()
  @PrimaryColumn()
  indexInActionReceipt: number;

  @ManyToOne(() => Transaction)
  @JoinColumn({
    name: 'receipt_id',
    referencedColumnName: 'convertedIntoReceiptId',
  })
  transaction: Transaction;

  @ManyToOne(() => Receipt)
  @JoinColumn({
    name: 'receipt_id',
    referencedColumnName: 'receiptId',
  })
  receipt: Receipt;

  @Column()
  receiptPredecessorAccountId: string;

  @Column()
  receiptReceiverAccountId: string;

  @ApiProperty({
    enum: Object.keys(ActionKind),
  })
  @Column({
    type: 'enum',
    enum: ActionKind,
  })
  actionKind: ActionKind;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  args: Record<string, unknown>;
}
