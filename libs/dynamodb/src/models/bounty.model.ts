import {
  Bounty,
  BountyClaim,
  BountyClaimDto,
  BountyContextDto,
  BountyDto,
} from '@sputnik-v2/bounty';
import { buildEntityId } from '@sputnik-v2/utils';
import { DynamoEntityType, PartialEntity } from '../types';
import { TransactionModel } from './transaction.model';

export class BountyModel extends TransactionModel {
  bountyId: number;
  id: string;
  daoId: string;
  proposalId: string;
  proposalIndex: number;
  description: string;
  token: string;
  amount: string;
  times: number;
  maxDeadline: string;
  numberOfClaims: number;
  commentsCount: number;
  bountyClaims: BountyClaimModel[];
  bountyDoneProposalIds: string[];
}

export class BountyClaimModel {
  id: string;
  accountId: string;
  startTime: string;
  deadline: string;
  completed: boolean;
  endTime: string;
}

export function mapBountyContextDtoToBountyModel(
  bountyContext: BountyContextDto,
  proposalIndex: number,
): PartialEntity<BountyModel> {
  return {
    partitionId: bountyContext.daoId,
    entityId: buildEntityId(DynamoEntityType.Bounty, String(proposalIndex)),
    entityType: DynamoEntityType.Bounty,
    transactionHash: bountyContext.transactionHash,
    createTimestamp: bountyContext.createTimestamp,
    proposalIndex,
  };
}

export function mapBountyDtoToBountyModel(
  bounty: Partial<BountyDto>,
): PartialEntity<BountyModel> {
  return {
    partitionId: bounty.daoId,
    entityId: buildEntityId(
      DynamoEntityType.Bounty,
      String(bounty.proposalIndex),
    ),
    entityType: DynamoEntityType.Bounty,
    isArchived: false,
    transactionHash: bounty.transactionHash,
    updateTransactionHash: bounty.updateTransactionHash,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createTimestamp: bounty.createTimestamp,
    updateTimestamp: bounty.updateTimestamp,
    id: bounty.id,
    daoId: bounty.daoId,
    bountyId: bounty.bountyId,
    proposalId: bounty.proposalId,
    proposalIndex: bounty.proposalIndex,
    description: bounty.description,
    token: bounty.token,
    amount: bounty.amount,
    times: bounty.times,
    maxDeadline: bounty.maxDeadline,
    numberOfClaims: bounty.numberOfClaims,
    commentsCount: 0,
    bountyClaims: bounty.bountyClaims
      ? bounty.bountyClaims.map(mapBountyClaimToBountyClaimModel)
      : [],
    bountyDoneProposalIds: bounty.bountyDoneProposalIds,
  };
}

export function mapBountyToBountyModel(
  bounty: Partial<Bounty>,
  proposalIndex: number,
): PartialEntity<BountyModel> {
  return {
    partitionId: bounty.daoId,
    entityId: buildEntityId(DynamoEntityType.Bounty, String(proposalIndex)),
    entityType: DynamoEntityType.Bounty,
    isArchived: bounty.isArchived,
    transactionHash: bounty.transactionHash,
    updateTransactionHash: bounty.updateTransactionHash,
    createdAt: bounty.createdAt ? bounty.createdAt.getTime() : undefined,
    updatedAt: bounty.updatedAt ? bounty.updatedAt.getTime() : undefined,
    createTimestamp: bounty.createTimestamp,
    updateTimestamp: bounty.updateTimestamp,
    id: bounty.id,
    daoId: bounty.daoId,
    bountyId: bounty.bountyId,
    proposalId: bounty.proposalId,
    proposalIndex: proposalIndex,
    description: bounty.description,
    token: bounty.token,
    amount: bounty.amount,
    times: bounty.times,
    maxDeadline: bounty.maxDeadline,
    numberOfClaims: bounty.numberOfClaims,
    commentsCount: bounty.bountyContext?.commentsCount,
    bountyClaims: bounty.bountyClaims
      ? bounty.bountyClaims.map(mapBountyClaimToBountyClaimModel)
      : [],
    bountyDoneProposalIds: bounty.bountyDoneProposals?.length
      ? bounty.bountyDoneProposals.map(({ id }) => id)
      : [],
  };
}

export function mapBountyClaimToBountyClaimModel(
  bountyClaim: BountyClaim | BountyClaimDto,
): BountyClaimModel {
  return {
    id: bountyClaim.id,
    accountId: bountyClaim.accountId,
    startTime: bountyClaim.startTime,
    deadline: bountyClaim.deadline,
    completed: bountyClaim.completed,
    endTime: bountyClaim.endTime,
  };
}
