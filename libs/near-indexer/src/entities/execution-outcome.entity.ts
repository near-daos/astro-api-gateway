import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ExecutionOutcomeStatus } from '../types';

@Entity({ name: 'execution_outcomes' })
export class ExecutionOutcome {
  @ApiProperty()
  @PrimaryColumn()
  receiptId: string;

  @ApiProperty()
  @Column()
  executedInBlockHash: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  executedInBlockTimestamp: string; // nanoseconds

  @ApiProperty()
  @Column()
  indexInChunk: number;

  @ApiProperty()
  @Column()
  gasBurnt: string;

  @ApiProperty()
  @Column()
  tokensBurnt: string;

  @ApiProperty()
  @Column()
  executorAccountId: string;

  @ApiProperty({
    enum: Object.keys(ExecutionOutcomeStatus),
  })
  @Column({
    type: 'enum',
    enum: ExecutionOutcomeStatus,
  })
  status: string;

  @ApiProperty()
  @Column()
  shardId: number;
}
