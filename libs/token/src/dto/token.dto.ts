export interface TokenUpdateDto {
  account: string;
  token: string;
  timestamp: number;
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

export interface TokenDto extends TokenMetadataDto {
  id: string;
  ownerId: string;
  totalSupply: string;
  price?: string;

  transactionHash?: string;
  updateTransactionHash?: string;
  // TODO: use bigint
  createTimestamp?: number;
  updateTimestamp?: number;
}
