import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { Proposal } from '@sputnik-v2/proposal/entities/proposal.entity';

import { Bounty } from './bounty.entity';

@Entity()
export class BountyContext extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  daoId: string;

  @OneToOne(() => Proposal)
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  proposal: Proposal;

  @ApiProperty()
  @OneToOne(() => Bounty, (bounty) => bounty.bountyContext, { nullable: true })
  bounty: Bounty;
}
