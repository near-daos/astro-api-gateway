import { ApiProperty } from '@nestjs/swagger';
import { Dao } from '../../daos/entities/dao.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { BaseEntity } from '../../common';
import { Account } from '../../account/entities/account.entity';

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
  account: Account

  @ApiProperty()
  @Column()
  accountId: string;
}
