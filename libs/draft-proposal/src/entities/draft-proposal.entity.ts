import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { ProposalKind, ProposalType } from '@sputnik-v2/proposal';

import { DraftProposalState } from '../types';

@Entity()
export class DraftProposal extends BaseEntity {
  @ObjectIdColumn({ unique: true })
  id: string;

  @Column()
  daoId: string;

  @Column()
  proposalId: string;

  @Column()
  proposer: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  kind: ProposalKind;

  @Column({
    type: 'enum',
    enum: ProposalType,
  })
  type: ProposalType;

  @Column()
  state: DraftProposalState;

  @Column()
  viewAccounts: string[];

  @Column()
  saveAccounts: string[];

  @Column()
  replies: number;
}
