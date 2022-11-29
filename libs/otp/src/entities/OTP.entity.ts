import { ApiProperty } from '@nestjs/swagger';
import { numberTransformer } from '@sputnik-v2/common';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OTP {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  key: string;

  @ApiProperty()
  @Column({ type: 'text' })
  hash: string;

  @ApiProperty()
  @Column({ type: 'bigint', transformer: numberTransformer() })
  createdAt: number; // milliseconds

  @ApiProperty()
  @Column({ type: 'bigint', transformer: numberTransformer() })
  ttl: number; // milliseconds
}
