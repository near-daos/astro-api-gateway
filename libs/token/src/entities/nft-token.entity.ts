import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '@sputnik-v2/common';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { NFTTokenMetadata } from './nft-token-metadata.entity';

@Entity()
export class NFTToken extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  ownerId: string;

  @ApiProperty()
  @Column({ nullable: true })
  tokenId: string;

  @ApiProperty()
  @Column({ nullable: true })
  minter: string;

  // Metadata
  @ApiProperty()
  @OneToOne((_) => NFTTokenMetadata, { eager: true, cascade: true })
  @JoinColumn({ name: 'id' })
  metadata: NFTTokenMetadata;
}
