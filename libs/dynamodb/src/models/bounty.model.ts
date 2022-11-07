import { Bounty, BountyClaim } from '@sputnik-v2/bounty';
import { TransactionModel } from './transaction.model';
import { DynamoEntityType } from '../types';

export class BountyModel extends TransactionModel {
  bountyId: number;
  id: string;
  proposalId: string;
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

export function mapBountyToBountyModel(
  bounty: Partial<Bounty>,
  proposalId = bounty.bountyContext?.proposal?.proposalId,
): BountyModel {
  return {
    partitionId: bounty.daoId,
    entityId: `${DynamoEntityType.Bounty}:${proposalId}`,
    entityType: DynamoEntityType.Bounty,
    isArchived: bounty.isArchived,
    processingTimeStamp: Date.now(),
    transactionHash: bounty.transactionHash,
    updateTransactionHash:
      bounty.updateTransactionHash || bounty.transactionHash,
    createTimestamp: bounty.createTimestamp,
    updateTimestamp: bounty.updateTimestamp || bounty.createTimestamp,
    id: bounty.id,
    bountyId: bounty.bountyId,
    proposalId: bounty.proposalId,
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
