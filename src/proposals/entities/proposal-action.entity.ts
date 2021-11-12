import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Action } from '../types/action';
import { Proposal } from './proposal.entity';

@Entity()
export class ProposalAction {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  proposalId: string;

  @ManyToOne(() => Proposal, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'proposal_id' })
  proposal: Proposal;

  @ApiProperty()
  @Column()
  accountId: string;

  @ApiProperty()
  @Column()
  action: Action;

  @ApiProperty()
  @Column({ nullable: true })
  transactionHash: string;

  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  timestamp: number;
}
