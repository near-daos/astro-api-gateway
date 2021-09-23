import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Receipt } from '..';
import { ActionKind } from '../types/action-kind';

@Entity({ name: 'action_receipt_actions' })
export class ReceiptAction {
  @ApiProperty()
  @PrimaryColumn()
  receiptId: string;

  @OneToOne((_) => Receipt, (receipt) => receipt.receiptAction, {
    nullable: true,
    createForeignKeyConstraints: false,
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
  actionKind: string;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  args: Record<string, unknown>;
}
