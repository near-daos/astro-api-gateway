import { ApiProperty } from '@nestjs/swagger';
import { Dao } from 'src/daos/entities/dao.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Bounty {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  bountyId: number;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty()
  @ManyToOne((_) => Dao, { eager: true })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  token: string;

  @ApiProperty()
  @Column()
  amount: string;

  @ApiProperty()
  @Column()
  times: string;

  @ApiProperty()
  @Column()
  maxDeadline: string;
}
