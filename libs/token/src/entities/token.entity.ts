import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TransactionEntity } from '@sputnik-v2/common';

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
  tokenId?: string;

  @ApiProperty()
  balance?: string;
}
