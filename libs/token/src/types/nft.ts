import camelcaseKeys from 'camelcase-keys';
import { NFTTokenDto } from '@sputnik-v2/token';
import { buildNFTTokenId } from '@sputnik-v2/utils';

export function castNFT(
  nftContractId: string,
  accountId: string,
  metadata,
  nft,
  timestamp,
): NFTTokenDto {
  const nftToken = camelcaseKeys(nft, { deep: true });
  const tokenId = nftToken.id || nftToken.tokenId || 0;
  const id = buildNFTTokenId(nftContractId, tokenId);
  return {
    ...nftToken,
    id: id,
    accountId: accountId,
    tokenId: tokenId,
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
    createdAt: new Date(),
  };
}
