import { TransactionInfo } from "src/common/dto/TransactionInfo";

export interface NFTTokenMetadataDto {
  copies: number;
  description: string;
  expiresAt: string;
  extra: string;
  issuedAt: string;
  media: string;
  mediaHash: string;
  reference: string;
  referenceHash: string;
  startsAt: string;
  title: string;
  updatedAt: string;
  approvedAccountIds: string[];
}

export interface NFTTokenDto extends TransactionInfo {
  id: string;
  tokenId: string;
  ownerId: string;
  minter: string;
  metadata: NFTTokenMetadataDto;
}
