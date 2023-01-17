import { Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NftEventKind } from '../types/nft-event-kind';

@Entity({ name: 'assets__non_fungible_token_events' })
export class AssetsNftEvent {
  @ApiProperty()
  @PrimaryColumn()
  emittedForReceiptId: string;

  @ApiProperty()
  @PrimaryColumn({ type: 'bigint' })
  emittedAtBlockTimestamp: string; // nanoseconds

  @ApiProperty()
  @PrimaryColumn({ type: 'bigint' })
  emittedInShardId: string;

  @ApiProperty()
  @PrimaryColumn()
  emittedIndexOfEventEntryInShard: number;

  @ApiProperty()
  @PrimaryColumn()
  emittedByContractAccountId: string;

  @ApiProperty()
  @PrimaryColumn()
  tokenId: string;

  @ApiProperty()
  @PrimaryColumn({
    type: 'enum',
    enum: NftEventKind,
  })
  eventKind: NftEventKind;

  @ApiProperty()
  @PrimaryColumn()
  tokenOldOwnerAccountId: string;

  @ApiProperty()
  @PrimaryColumn()
  tokenNewOwnerAccountId: string;

  @ApiProperty()
  @PrimaryColumn()
  tokenAuthorizedAccountId: string;

  @ApiProperty()
  @PrimaryColumn()
  eventMemo: string;
}
