import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common';
import { VotePolicy } from 'src/sputnikdao/types/vote-policy';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
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

  @ApiProperty()
  @Column({ type: 'simple-json' })
  defaultVotePolicy: VotePolicy;

  @ApiProperty()
  @OneToMany(() => Role, (role) => role.policy, { cascade: true, eager: true })
  roles: Role[];
}
