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
  @Column({ type: 'float', nullable: true })
  totalDaoFunds: number;

  @ApiProperty()
  @Column({ nullable: true })
  transactionsCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  bountyCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  nftCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  activeProposalCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  totalProposalCount: number;
}
