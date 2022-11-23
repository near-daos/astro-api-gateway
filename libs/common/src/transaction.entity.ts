import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class TransactionEntity extends BaseEntity {
  @ApiProperty()
  @Column({ nullable: true })
  transactionHash: string;

  @ApiProperty()
  @Column({ nullable: true })
  updateTransactionHash: string;

  // TODO: use bigint
  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  createTimestamp: number;

  // TODO: use bigint
  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  updateTimestamp: number;
}
