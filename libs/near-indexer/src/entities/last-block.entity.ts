import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'last_block' })
export class LastBlock {
  @ApiProperty()
  @PrimaryColumn({ type: 'bigint' })
  blockHeight: string;

  @ApiProperty()
  @Column({ type: 'timestamp without time zone' })
  updatedDate: Date;

  @ApiProperty()
  @Column()
  blockTimestamp: string;
}
