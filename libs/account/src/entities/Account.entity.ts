import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

@Entity()
export class Account extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  accountId: string;

  @ApiProperty()
  @Column({ nullable: true })
  email: string;

  @ApiProperty()
  @Column({ nullable: true })
  isEmailVerified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  notifiUserId: string;

  @Column({ nullable: true })
  notifiAlertId: string;
}
