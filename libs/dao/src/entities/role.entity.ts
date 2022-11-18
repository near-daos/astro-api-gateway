import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

import { VotePolicy } from '../types';
import { Policy } from './policy.entity';

export enum RoleKindType {
  Everyone = 'Everyone',
  /// Member greater or equal than given balance. Can use `1` as non-zero balance.
  Member = 'Member',
  /// Set of accounts.
  Group = 'Group',
}

@Entity()
export class Role extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ManyToOne(() => Policy, (policy) => policy.roles)
  policy: Policy;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  kind: RoleKindType;

  @ApiProperty()
  @Column({ type: 'numeric', precision: 45, nullable: true })
  balance: number;

  @ApiProperty()
  @Column({ type: 'text', array: true, nullable: true })
  accountIds: string[];

  @ApiProperty()
  @Column({ type: 'text', array: true })
  permissions: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(VotePolicy) },
  })
  @Column({ type: 'simple-json', nullable: true })
  votePolicy: Record<string, VotePolicy>;
}
