import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TransactionHandlerState {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  lastBlockTimestamp: number;

  @ApiProperty()
  @Column()
  lastBlockHash: string;
}
