import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '@sputnik-v2/common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { NFTTokenMetadata } from './nft-token-metadata.entity';
import { NFTContract } from './nft-contract.entity';

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
  accountId: string;

  @ApiProperty()
  @Column({ nullable: true })
  minter: string;

  @ApiProperty()
  @Column({ nullable: true })
  contractId: string;

  @ApiProperty()
  @ManyToOne(() => NFTContract, { eager: true, cascade: true })
  @JoinColumn({ name: 'contract_id' })
  contract: NFTContract;

  // Metadata
  @ApiProperty()
  @OneToOne(() => NFTTokenMetadata, (metadata) => metadata.token, {
    eager: true,
    cascade: true,
  })
  metadata: NFTTokenMetadata;
}
