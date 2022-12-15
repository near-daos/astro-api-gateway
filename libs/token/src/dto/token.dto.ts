import { TransactionInfo } from '@sputnik-v2/common';

export interface TokenUpdateDto {
  account: string;
  token: string;
  timestamp: string; // nanoseconds
}

export interface TokenMetadataDto {
  decimals: number;
  icon: string;
  name: string;
  reference: string;
  referenceHash: string;
  spec: string;
  symbol: string;
}

export interface TokenDto extends TransactionInfo, TokenMetadataDto {
  id: string;
  ownerId: string;
  totalSupply: string;
  price?: string;
}
