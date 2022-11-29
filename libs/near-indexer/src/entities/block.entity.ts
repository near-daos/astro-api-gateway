import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'blocks' })
export class Block {
  @Column({ type: 'int' })
  @Index()
  blockHeight: string;

  @PrimaryColumn('text')
  blockHash: string;

  @Column('text')
  @Index()
  prevBlockHash: string;

  @Column({ type: 'bigint' })
  @Index()
  blockTimestamp: string; // nanoseconds

  @Column({ type: 'bigint' })
  totalSupply: string;

  @Column({ type: 'bigint' })
  gasPrice: string;

  @Column('text')
  authorAccountId: string;
}
