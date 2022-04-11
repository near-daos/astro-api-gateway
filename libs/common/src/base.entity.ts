import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty()
  @Exclude()
  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty()
  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
