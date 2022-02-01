import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@sputnik-v2/common';
import { DaoSettingsDto } from '../dto';

@Entity()
export class DaoSettings extends BaseEntity {
  @ApiProperty()
  @PrimaryColumn({ type: 'text' })
  daoId: string;

  @ApiProperty({ type: DaoSettingsDto })
  @Column({ type: 'simple-json' })
  settings: DaoSettingsDto;
}
