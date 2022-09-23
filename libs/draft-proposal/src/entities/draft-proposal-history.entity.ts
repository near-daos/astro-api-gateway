import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { ProposalKind, ProposalType } from '@sputnik-v2/proposal';

@Entity()
export class DraftProposalHistory extends BaseEntity {
  @ObjectIdColumn({ unique: true })
  id: string;

  @Column()
  draftProposalId: string;

  @Column()
  daoId: string;

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
  date: Date;
}
