import Decimal from 'decimal.js';
import { TokenDto } from '@sputnik-v2/token';
import { yoktoNear } from '@sputnik-v2/sputnikdao';
import { FTokenMetadata } from '@sputnik-v2/near-api';

export function castToken(
  tokenId: string,
  tokenMetadata: FTokenMetadata,
  totalSupply: string,
  timestamp: number,
): TokenDto {
  return {
    id: tokenId,
    totalSupply,
    spec: tokenMetadata.spec,
    name: tokenMetadata.name,
    symbol: tokenMetadata.symbol,
    icon: tokenMetadata.icon,
    reference: tokenMetadata.reference,
    referenceHash: tokenMetadata.reference_hash,
    decimals: tokenMetadata.decimals,
    ownerId: '', // TODO: drop
    updateTimestamp: timestamp,
  };
}

export function castNearToken(price?: string) {
  return {
    id: 'NEAR',
    symbol: 'NEAR',
    decimals: new Decimal(yoktoNear).toFixed().length - 1,
    price,
    ownerId: '', // TODO: drop
    totalSupply: '',
  };
}
