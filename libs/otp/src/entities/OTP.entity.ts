import { ApiProperty } from '@nestjs/swagger';
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
  @Column({ type: 'bigint' }) // TODO: incorrect column type for number, returns as string
  createdAt: number; // milliseconds

  @ApiProperty()
  @Column({ type: 'bigint' }) // TODO: incorrect column type for number, returns as string
  ttl: number; // milliseconds
}
