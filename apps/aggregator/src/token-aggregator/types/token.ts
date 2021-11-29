import camelcaseKeys from 'camelcase-keys';
import { TokenDto } from '@sputnik-v2/token';
import { getBlockTimestamp } from '@sputnik-v2/utils';

export function castToken(
  tokenId: string,
  tokenMetadata,
  totalSupply,
  timestamp = getBlockTimestamp(),
): TokenDto {
  return {
    id: tokenId,
    ...camelcaseKeys(tokenMetadata),
    totalSupply,
    ownerId: '',
    updateTimestamp: timestamp,
  };
}
