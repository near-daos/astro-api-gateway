import { Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { FtEventKind } from '../types/ft-event-kind';

@Entity({ name: 'assets__fungible_token_events' })
export class AssetsFtEvent {
  @ApiProperty()
  @PrimaryColumn()
  emittedForReceiptId: string;

  @ApiProperty()
  @PrimaryColumn({ type: 'bigint' })
  emittedAtBlockTimestamp: number;

  @ApiProperty()
  @PrimaryColumn({ type: 'bigint' })
  emittedInShardId: number;

  @ApiProperty()
  @PrimaryColumn()
  emittedIndexOfEventEntryInShard: number;

  @ApiProperty()
  @PrimaryColumn()
  emittedByContractAccountId: string;

  @ApiProperty()
  @PrimaryColumn()
  amount: string;

  @ApiProperty()
  @PrimaryColumn({
    type: 'enum',
    enum: FtEventKind,
  })
  eventKind: string;

  @ApiProperty()
  @PrimaryColumn()
  tokenOldOwnerAccountId: string;

  @ApiProperty()
  @PrimaryColumn()
  tokenNewOwnerAccountId: string;

  @ApiProperty()
  @PrimaryColumn()
  eventMemo: string;
}
