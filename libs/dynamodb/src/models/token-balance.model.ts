import { TokenBalance } from '@sputnik-v2/token/entities';

export class TokenBalanceModel {
  tokenId: string;
  accountId: string;
  balance: string;
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
}

export function mapTokenBalanceToTokenBalanceModel(
  balance: TokenBalance,
): TokenBalanceModel {
  const token = balance.token;
  return {
    tokenId: balance.tokenId,
    accountId: balance.accountId,
    balance: balance.balance,
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
  };
}
