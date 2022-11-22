import camelcaseKeys from 'camelcase-keys';
import Decimal from 'decimal.js';
import { TokenDto } from '@sputnik-v2/token';
import { yoktoNear } from '@sputnik-v2/sputnikdao';

export function castToken(
  tokenId: string,
  tokenMetadata,
  totalSupply,
  timestamp,
): TokenDto {
  return {
    id: tokenId,
    ...camelcaseKeys(tokenMetadata),
    totalSupply,
    ownerId: '',
    updateTimestamp: timestamp,
  };
}

export function castNearToken(price?: string) {
  return {
    id: 'NEAR',
    symbol: 'NEAR',
    decimals: new Decimal(yoktoNear).toFixed().length - 1,
    price,
    ownerId: '',
    totalSupply: '',
  };
}
