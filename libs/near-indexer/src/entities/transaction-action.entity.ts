import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

import { ActionKind } from '../types/action-kind';

@Entity({ name: 'transaction_actions' })
export class TransactionAction extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn()
  transactionHash: string;

  @ApiHideProperty()
  @Exclude()
  @Column()
  indexInTransaction: number;

  @ApiProperty({
    enum: Object.keys(ActionKind),
  })
  @Column({
    type: 'enum',
    enum: ActionKind,
  })
  actionKind: string;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  args: Record<string, unknown>;
}
