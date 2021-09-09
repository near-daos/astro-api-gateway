import { TransactionInfo } from "src/common/dto/TransactionInfo";

export interface TokenMetadataDto {
  decimals: number;
  icon: string;
  name: string;
  reference: string;
  referenceHash: string;
  spec: string;
  symbol: string;
}

export interface TokenDto extends TransactionInfo {
  id: string; // transaction_hash
  ownerId: string;
  totalSupply: string;
  metadata: TokenMetadataDto;
}
