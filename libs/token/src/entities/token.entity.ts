import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { TransactionEntity } from '@sputnik-v2/common';

import { TokenBalance } from './token-balance.entity';

@Entity()
export class Token extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  ownerId: string;

  @ApiProperty()
  @Column()
  totalSupply: string;

  // Metadata

  @ApiProperty()
  @Column()
  decimals: number;

  @ApiProperty()
  @Column({ nullable: true })
  icon: string;

  @ApiProperty()
  @Column({ nullable: true })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  reference: string;

  @ApiProperty()
  @Column({ nullable: true })
  referenceHash: string;

  @ApiProperty()
  @Column({ nullable: true })
  spec: string;

  @ApiProperty()
  @Column({ nullable: true })
  symbol: string;

  @ApiProperty()
  @Column({ nullable: true })
  price: string;

  @ApiProperty()
  tokenId?: string;

  @ApiProperty()
  balance?: string;

  @ApiProperty({ type: [TokenBalance] })
  @OneToMany(() => TokenBalance, (token) => token.tokenId, {
    cascade: true,
    persistence: false,
  })
  balances: TokenBalance[];
}
