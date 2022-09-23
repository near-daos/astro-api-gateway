import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'blocks' })
export class Block {
  @Column({ type: 'int' })
  @Index()
  blockHeight: number;

  @PrimaryColumn('text')
  blockHash: string;

  @Column('text')
  @Index()
  prevBlockHash: string;

  @Column({ type: 'bigint' })
  @Index()
  blockTimestamp: bigint;

  @Column({ type: 'bigint' })
  totalSupply: bigint;

  @Column({ type: 'bigint' })
  gasPrice: bigint;

  @Column('text')
  authorAccountId: string;
}
