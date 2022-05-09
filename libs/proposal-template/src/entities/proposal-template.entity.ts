import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';
import { ProposalTemplateConfigDto } from '@sputnik-v2/proposal-template/dto';

@Entity()
export class ProposalTemplate extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  daoId: string;

  @ApiProperty()
  @ManyToOne(() => Dao, { eager: false })
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  isEnabled: boolean;

  @ApiProperty({ type: ProposalTemplateConfigDto })
  @Column({ type: 'simple-json' })
  config: ProposalTemplateConfigDto;
}
