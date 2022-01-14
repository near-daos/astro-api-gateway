import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

import { Notification } from './notification.entity';

@Entity()
export class AccountNotification extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  notificationId: string;

  @ApiProperty()
  @ManyToOne(() => Notification, { eager: true })
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @ApiProperty()
  @Column()
  accountId: string;

  @ApiProperty()
  @Column()
  isMuted: boolean;

  @ApiProperty()
  @Column()
  isRead: boolean;
}
