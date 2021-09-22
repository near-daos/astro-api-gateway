import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class NFTTokenMetadata {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  tokenId: string;

  @ApiProperty()
  @Column({ nullable: true })
  copies: number;

  @ApiProperty()
  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @Column({ nullable: true })
  expiresAt: string;

  @ApiProperty()
  @Column({ nullable: true })
  extra: string;

  @ApiProperty()
  @Column({ nullable: true })
  issuedAt: string;

  @ApiProperty()
  @Column({ nullable: true })
  media: string;

  @ApiProperty()
  @Column({ nullable: true })
  mediaHash: string;

  @ApiProperty()
  @Column({ nullable: true })
  reference: string;

  @ApiProperty()
  @Column({ nullable: true })
  referenceHash: string;

  @ApiProperty()
  @Column({ nullable: true })
  startsAt: string;

  @ApiProperty()
  @Column({ nullable: true })
  title: string;

  @ApiProperty()
  @Column({ nullable: true })
  updatedAt: string;

  @ApiProperty()
  @Column({ type: 'text', array: true, nullable: true })
  approvedAccountIds: string[];
}
