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
  @Column({ type: 'bigint' })
  createdAt: number;

  @ApiProperty()
  @Column({ type: 'bigint' })
  ttl: number;
}
