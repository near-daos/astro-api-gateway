import { ApiProperty } from '@nestjs/swagger';
import { Dao } from '../../daos/entities/dao.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Subscription {

  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @OneToOne(_ => Dao)
  @JoinColumn({ name: "dao_id" })
  dao: Dao;

  @ApiProperty()
  @Column()
  accountId: string;

  @Column()
  token: string;
}
