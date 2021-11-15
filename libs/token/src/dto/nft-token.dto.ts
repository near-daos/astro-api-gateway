import { ApiProperty } from '@nestjs/swagger';
import { TransactionInfo } from '@sputnik-v2/common';

export class NFTTokenMetadataDto {
  @ApiProperty()
  copies: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty()
  extra: string;

  @ApiProperty()
  issuedAt: string;

  @ApiProperty()
  media: string;

  @ApiProperty()
  mediaHash: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  referenceHash: string;

  @ApiProperty()
  startsAt: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  approvedAccountIds: string[];
}

export class NFTTokenDto extends TransactionInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  minter: string;

  @ApiProperty()
  baseUri: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  referenceHash: string;

  @ApiProperty()
  metadata: NFTTokenMetadataDto;
}
