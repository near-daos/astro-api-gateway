import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

import { NotificationType } from '../types';

@Entity()
export class AccountNotificationSettings extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  accountId: string;

  @ApiProperty()
  @Column({ nullable: true })
  daoId: string;

  @ApiProperty()
  @Column({ type: 'text', array: true })
  types: NotificationType[];

  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  mutedUntilTimestamp: number;

  @ApiProperty()
  @Column()
  isAllMuted: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  enableSms: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  enableEmail: boolean;
}
