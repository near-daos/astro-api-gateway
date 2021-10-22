import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Transaction } from '..';
import { ActionKind } from '../types/action-kind';

@Entity({ name: 'action_receipt_actions' })
export class ActionReceiptAction {
  @ApiProperty()
  @PrimaryColumn()
  receiptId: string;

  @ApiProperty()
  @PrimaryColumn()
  indexInActionReceipt: number;

  @OneToOne((_) => Transaction)
  @JoinColumn({
    name: 'receipt_id',
    referencedColumnName: 'convertedIntoReceiptId',
  })
  transaction: Transaction;

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
  actionKind: string;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  args: Record<string, unknown>;
}
