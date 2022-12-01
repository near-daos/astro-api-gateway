import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Dao } from '@sputnik-v2/dao/entities/dao.entity';
import { BaseEntity } from '@sputnik-v2/common';

import { NotificationType, NotificationStatus } from '../types';

@Entity()
export class Notification extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty()
  @ManyToOne(() => Dao, { eager: true })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @ApiProperty()
  @Column()
  targetId: string;

  @ApiProperty()
  @Column({ nullable: true })
  signerId: string;

  @ApiProperty({ enum: NotificationType })
  @Column({ type: 'text' })
  type: NotificationType;

  @ApiProperty({ enum: NotificationStatus })
  @Column({ type: 'text', nullable: true })
  status: NotificationStatus;

  @ApiProperty()
  @Column({ type: 'simple-json' })
  metadata: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'bigint', nullable: true })
  timestamp: string; // nanoseconds
}
