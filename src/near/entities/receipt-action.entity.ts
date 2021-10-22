import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Receipt } from '..';
import { ActionKind } from '../types/action-kind';

@Entity({ name: 'action_receipt_actions' })
export class ReceiptAction {
  @ApiProperty()
  @PrimaryColumn()
  receiptId: string;

  @ApiProperty()
  @PrimaryColumn()
  indexInActionReceipt: number;

  @ManyToOne((_) => Receipt, (receipt) => receipt.receiptActions, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'receipt_id' })
  receipt: Receipt;

  @ApiProperty()
  @Column()
  receiptPredecessorAccountId: string;

  @ApiProperty()
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
