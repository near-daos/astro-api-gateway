import { ApiProperty } from '@nestjs/swagger';

export interface NFTTokenUpdateDto {
  account: string;
  nft: string;
  timestamp: number;
}

export class NFTTokenContractDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  spec: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  baseUri: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  referenceHash: string;
}

export class NFTTokenMetadataDto {
  @ApiProperty()
  tokenId: string;

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

export class NFTTokenDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  minter: string;

  @ApiProperty()
  contractId: string;

  @ApiProperty()
  contract: NFTTokenContractDto;

  @ApiProperty()
  metadata: NFTTokenMetadataDto;

  @ApiProperty()
  transactionHash?: string;

  @ApiProperty()
  updateTransactionHash?: string;

  @ApiProperty()
  // TODO: use bigint
  createTimestamp?: number;

  @ApiProperty()
  // TODO: use bigint
  updateTimestamp?: number;
}
