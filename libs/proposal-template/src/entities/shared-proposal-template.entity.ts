import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';

import { BaseEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';
import { ProposalTemplateConfigDto } from '@sputnik-v2/proposal-template/dto';

@Entity()
export class SharedProposalTemplate extends BaseEntity {
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @Column()
  createdBy: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Dao, {
    eager: false,
    nullable: true,
  })
  @JoinTable({
    name: 'shared_proposal_template_dao',
    joinColumn: { name: 'proposal_template_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'dao_id', referencedColumnName: 'id' },
  })
  @JoinColumn({ name: 'id' })
  daos?: Dao[];

  @Column()
  daoCount: number;

  @Column({ type: 'simple-json' })
  config: ProposalTemplateConfigDto;
}
