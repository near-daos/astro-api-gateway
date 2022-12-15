import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { ErrorStatus, ErrorType } from '../types';

@Entity('error')
export class ErrorEntity extends BaseEntity {
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @Column({ type: 'text' })
  type: ErrorType;

  @Column({ type: 'text', default: ErrorStatus.Open })
  status: ErrorStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'bigint', nullable: true })
  timestamp: string; // nanoseconds
}
