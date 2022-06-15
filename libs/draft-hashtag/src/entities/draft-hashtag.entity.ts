import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { BaseEntity } from '@sputnik-v2/common';

@Entity()
export class DraftHashtag extends BaseEntity {
  @ApiProperty()
  @ObjectIdColumn({ unique: true })
  id: string;

  @ApiProperty()
  @Column({ unique: true, nullable: false })
  value: string;
}
