import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

@Entity()
export class DaoStats extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  @Index()
  daoId: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  timestamp: number;

  @ApiProperty()
  @Column({ type: 'float' })
  totalDaoFunds: number;

  @ApiProperty()
  @Column({ nullable: true })
  transactionsCount: number;

  @ApiProperty()
  @Column()
  bountyCount: number;

  @ApiProperty()
  @Column()
  nftCount: number;

  @ApiProperty()
  @Column()
  activeProposalCount: number;

  @ApiProperty()
  @Column()
  totalProposalCount: number;
}
