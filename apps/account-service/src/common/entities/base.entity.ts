import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  isArchived?: boolean;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;
}
