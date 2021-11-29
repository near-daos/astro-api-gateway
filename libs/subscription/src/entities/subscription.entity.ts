import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';
import { Account } from '@sputnik-v2/account/entities';

@Entity()
export class Subscription extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @ManyToOne((_) => Dao, { eager: true })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @ApiProperty()
  @ManyToOne((_) => Account, { eager: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ApiProperty()
  @Column()
  accountId: string;
}
