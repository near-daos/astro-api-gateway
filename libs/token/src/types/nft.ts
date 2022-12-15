import { NFTokenContractMetadata, NFTokenOutput } from '@sputnik-v2/near-api';
import { NFTTokenDto } from '@sputnik-v2/token';
import { buildNFTTokenId } from '@sputnik-v2/utils';

export function castNFT(
  nftContractId: string,
  accountId: string,
  contractMetadata: NFTokenContractMetadata,
  nft: NFTokenOutput,
  timestamp: string,
): NFTTokenDto {
  const tokenId = nft.id || nft.token_id || '0';
  const id = buildNFTTokenId(nftContractId, tokenId);
  const { metadata } = nft;
  return {
    id,
    tokenId: tokenId,
    accountId: accountId,
    ownerId:
      nft.owner_id instanceof Object ? nft.owner_id.Account : nft.owner_id,
    minter: nft.minter,
    contractId: nftContractId,
    metadata: {
      tokenId: id,
      title: metadata.title,
      description: metadata.description,
      media: metadata.media,
      mediaHash: metadata.media_hash,
      copies: nft.metadata.copies,
      issuedAt: metadata.issued_at ? String(metadata.issued_at) : null,
      expiresAt: metadata.expires_at ? String(metadata.expires_at) : null,
      startsAt: metadata.starts_at ? String(metadata.starts_at) : null,
      updatedAt: metadata.updated_at ? String(metadata.updated_at) : null,
      extra: metadata.extra,
      reference: metadata.reference,
      referenceHash: metadata.reference_hash,
      approvedAccountIds: nft.approved_account_ids,
    },
    contract: {
      id: nftContractId,
      name: contractMetadata.name,
      spec: contractMetadata.spec,
      symbol: contractMetadata.symbol,
      icon: contractMetadata.icon,
      baseUri: contractMetadata.base_uri,
      reference: contractMetadata.reference,
      referenceHash: contractMetadata.reference_hash,
    },
    updateTimestamp: timestamp,
  };
}
