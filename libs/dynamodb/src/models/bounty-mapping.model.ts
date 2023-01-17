import { Bounty } from '@sputnik-v2/bounty/entities';
import { buildEntityId } from '@sputnik-v2/utils';
import { DynamoEntityType, PartialEntity } from '../types';
import { BaseModel } from './base.model';

export class BountyMappingModel extends BaseModel {
  bountyProposalId: number;
}

export function mapBountyToBountyMappingModel(
  bounty: Partial<Bounty>,
  bountyProposalId: number,
): PartialEntity<BountyMappingModel> {
  return {
    partitionId: bounty.daoId,
    entityId: buildEntityId(
      DynamoEntityType.BountyMapping,
      String(bounty.bountyId),
    ),
    entityType: DynamoEntityType.BountyMapping,
    bountyProposalId,
    createdAt: bounty.createdAt ? bounty.createdAt.getTime() : undefined,
    updatedAt: bounty.updatedAt ? bounty.updatedAt.getTime() : undefined,
  };
}
