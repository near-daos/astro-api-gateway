import { Token, TokenBalance } from '@sputnik-v2/token';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class TokenBalanceModel extends BaseModel {
  tokenId: string;
  accountId: string;
  balance: string;
  token: TokenModel;
}

export class TokenModel {
  id: string;
  ownerId: string;
  totalSupply: string;
  decimals: number;
  icon: string;
  name: string;
  reference: string;
  referenceHash: string;
  spec: string;
  symbol: string;
  price: string;
  tokenId?: string;
  balance?: string;
}

export function mapTokenBalanceToTokenBalanceModel(
  balance: TokenBalance,
): TokenBalanceModel {
  return {
    partitionId: balance.accountId,
    entityId: `${DynamoEntityType.TokenBalance}:${balance.tokenId}`,
    entityType: DynamoEntityType.TokenBalance,
    isArchived: false,
    processingTimeStamp: Date.now(),
    tokenId: balance.tokenId,
    accountId: balance.accountId,
    balance: balance.balance,
    token: mapTokenToTokenModel(balance.token),
  };
}

export function mapTokenToTokenModel(token: Token): TokenModel {
  return {
    id: token.id,
    ownerId: token.ownerId,
    totalSupply: token.totalSupply,
    decimals: token.decimals,
    icon: token.icon,
    name: token.name,
    reference: token.reference,
    referenceHash: token.referenceHash,
    spec: token.spec,
    symbol: token.symbol,
    price: token.price,
    tokenId: token.tokenId,
    balance: token.balance,
  };
}
