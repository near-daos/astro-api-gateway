import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common';
import { RolePermission } from 'src/sputnikdao/types/role';
import { VotePolicy } from 'src/sputnikdao/types/vote-policy';
import { Column, Entity, PrimaryColumn } from 'typeorm';

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
  @Column({ type: 'jsonb' })
  defaultVotePolicy: VotePolicy;

  @ApiProperty()
  @Column({ type: 'jsonb' })
  roles: RolePermission[];
}
