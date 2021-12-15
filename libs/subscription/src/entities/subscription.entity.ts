import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';

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
  @Column()
  accountId: string;

  @ApiProperty()
  @Column()
  daoId: string;
}
