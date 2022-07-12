import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { VotePolicy } from '../types';

import { Role } from './role.entity';

@Entity()
export class Policy extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  daoId: string;

  @ApiProperty()
  @Column()
  proposalBond: string;

  @ApiProperty()
  @Column()
  bountyBond: string;

  @ApiProperty()
  @Column({ type: 'bigint' })
  proposalPeriod: number;

  @ApiProperty()
  @Column({ type: 'bigint' })
  bountyForgivenessPeriod: number;

  @ApiProperty({ type: VotePolicy })
  @Column({ type: 'simple-json' })
  defaultVotePolicy: VotePolicy;

  @ApiProperty({ type: [Role] })
  @OneToMany(() => Role, (role) => role.policy, { cascade: true, eager: true })
  roles: Role[];
}
