import camelcaseKeys from 'camelcase-keys';
import { NFTTokenDto } from '@sputnik-v2/token';
import { buildNFTTokenId, getBlockTimestamp } from '@sputnik-v2/utils';

export function castNFT(
  nftContractId: string,
  metadata,
  nft,
  timestamp = getBlockTimestamp(),
): NFTTokenDto {
  const nftToken = camelcaseKeys(nft, { deep: true });
  const id = buildNFTTokenId(nftContractId, nftToken.id);
  return {
    ...nftToken,
    id: id,
    tokenId: nftToken.id,
    ownerId: nftToken.ownerId.account || nftToken.ownerId,
    metadata: {
      ...nftToken.metadata,
      tokenId: id,
    },
    contractId: nftContractId,
    contract: {
      id: nftContractId,
      ...camelcaseKeys(metadata),
    },
    updateTimestamp: timestamp,
  };
}
