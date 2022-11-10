import {
  NFTContract,
  NFTToken,
  NFTTokenMetadata,
} from '@sputnik-v2/token/entities';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';
import {
  NFTTokenContractDto,
  NFTTokenDto,
  NFTTokenMetadataDto,
} from '@sputnik-v2/token';

export class NftModel extends BaseModel {
  id: string;
  ownerId: string;
  tokenId: string;
  accountId: string;
  minter: string;
  contractId: string;
  contract: NftContractModel;
  metadata: NftMetadataModel;
}

export class NftContractModel {
  id: string;
  spec: string;
  name: string;
  symbol: string;
  icon: string;
  baseUri: string;
  reference: string;
  referenceHash: string;
}

export class NftMetadataModel {
  tokenId: string;
  copies: number;
  description: string;
  expiresAt: string;
  extra: string;
  issuedAt: string;
  media: string;
  mediaHash: string;
  reference: string;
  referenceHash: string;
  startsAt: string;
  title: string;
  updatedAt: string;
  approvedAccountIds: string[];
}

export function mapNftTokenToNftModel(nft: NFTToken | NFTTokenDto): NftModel {
  return {
    partitionId: nft.accountId,
    entityId: buildEntityId(DynamoEntityType.Nft, nft.id),
    entityType: DynamoEntityType.Nft,
    isArchived: !!nft.isArchived,
    processingTimeStamp: Date.now(),
    id: nft.id,
    ownerId: nft.ownerId,
    tokenId: nft.tokenId,
    accountId: nft.accountId,
    minter: nft.minter,
    contractId: nft.contractId,
    contract: mapNftContractToNftContractModel(nft.contract),
    metadata: mapNftMetadataToNftMetadataModel(nft.metadata),
    createTimestamp: nft.createdAt.getTime(),
  };
}

export function mapNftContractToNftContractModel(
  contract: NFTContract | NFTTokenContractDto,
): NftContractModel {
  return {
    id: contract.id,
    spec: contract.spec,
    name: contract.name,
    symbol: contract.symbol,
    icon: contract.icon,
    baseUri: contract.baseUri,
    reference: contract.reference,
    referenceHash: contract.referenceHash,
  };
}

export function mapNftMetadataToNftMetadataModel(
  metadata: NFTTokenMetadata | NFTTokenMetadataDto,
): NftMetadataModel {
  return {
    tokenId: metadata.tokenId,
    copies: metadata.copies,
    description: metadata.description,
    expiresAt: metadata.expiresAt,
    extra: metadata.extra,
    issuedAt: metadata.issuedAt,
    media: metadata.media,
    mediaHash: metadata.mediaHash,
    reference: metadata.reference,
    referenceHash: metadata.referenceHash,
    startsAt: metadata.startsAt,
    title: metadata.title,
    updatedAt: metadata.updatedAt,
    approvedAccountIds: metadata.approvedAccountIds,
  };
}
