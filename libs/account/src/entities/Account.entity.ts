import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

@Entity()
export class Account extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  accountId: string;

  @Column()
  token: string;
}
