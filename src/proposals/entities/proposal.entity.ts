import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from 'src/common/transaction.entity';
import { Dao } from 'src/daos/entities/dao.entity';
import { Vote } from 'src/sputnikdao/types/vote';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProposalKind } from '../dto/proposal-kind.dto';
import { ProposalStatus } from '../types/proposal-status';

@Entity()
export class Proposal extends TransactionEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  proposalId: number;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty()
  @ManyToOne((_) => Dao, { eager: true })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @ApiProperty()
  @Column()
  proposer: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.InProgress,
  })
  status: ProposalStatus;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  kind: ProposalKind;

  @ApiProperty()
  @Column({ type: 'bigint' })
  submissionTime: number;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  voteCounts: Record<string, number[]>;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  votes: Record<string, Vote>;
}
