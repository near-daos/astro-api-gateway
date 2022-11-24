import { Bounty, BountyClaim, BountyContextDto } from '@sputnik-v2/bounty';
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
  times: string;
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

export function mapBountyContextToBountyModel(
  bountyContext: BountyContextDto,
): PartialEntity<BountyModel> {
  return {
    partitionId: bountyContext.daoId,
    entityId: buildEntityId(DynamoEntityType.Bounty, bountyContext.id),
    entityType: DynamoEntityType.Bounty,
  };
}

export function mapBountyToBountyModel(
  bounty: Partial<Bounty>,
  proposalIndex = bounty.bountyContext?.proposal?.proposalId,
): BountyModel {
  return {
    partitionId: bounty.daoId,
    entityId: buildEntityId(DynamoEntityType.Bounty, String(proposalIndex)),
    entityType: DynamoEntityType.Bounty,
    isArchived: bounty.isArchived,
    processingTimeStamp: Date.now(),
    transactionHash: bounty.transactionHash,
    updateTransactionHash:
      bounty.updateTransactionHash || bounty.transactionHash,
    createTimestamp: bounty.createTimestamp,
    updateTimestamp: bounty.updateTimestamp || bounty.createTimestamp,
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
      : undefined,
    bountyDoneProposalIds: bounty.bountyDoneProposals?.length
      ? bounty.bountyDoneProposals.map(({ id }) => id)
      : undefined,
  };
}

export function mapBountyClaimToBountyClaimModel(
  bountyClaim: BountyClaim,
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
