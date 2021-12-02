import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class NFTContract {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  spec: string;

  @ApiProperty()
  @Column({ nullable: true })
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  symbol: string;

  @ApiProperty()
  @Column({ nullable: true })
  icon: string;

  @ApiProperty()
  @Column({ nullable: true })
  baseUri: string;

  @ApiProperty()
  @Column({ nullable: true })
  reference: string;

  @ApiProperty()
  @Column({ nullable: true })
  referenceHash: string;
}
