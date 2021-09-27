import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BaseEntity } from 'src/common';
import { RoleKindType } from 'src/sputnikdao/types/role';
import { VotePolicy } from 'src/sputnikdao/types/vote-policy';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Policy } from './policy.entity';

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
  @Column({ type: 'bigint', nullable: true })
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
