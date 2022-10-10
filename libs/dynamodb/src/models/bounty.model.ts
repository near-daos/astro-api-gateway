import { TransactionModel } from './transaction.model';
import { Bounty, BountyClaim } from '@sputnik-v2/bounty';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import { buildBountyDynamoId } from '@sputnik-v2/utils';

export class BountyModel extends TransactionModel {
  bountyId: number;
  proposalId: string;
  daoId: string;
  description: string;
  token: string;
  amount: string;
  times: string;
  maxDeadline: string;
  numberOfClaims: number;
  commentsCount: number;
  bountyClaims: BountyClaimModel[];
}

export class BountyClaimModel {
  id: string;
  accountId: string;
  startTime: string;
  deadline: string;
  completed: boolean;
  endTime: string;
}

export function mapBountyToBountyModel(bounty: Partial<Bounty>): BountyModel {
  return {
    entityType: DynamoEntityType.Bounty,
    id: buildBountyDynamoId(bounty.proposalId),
    isArchived: bounty.isArchived,
    transactionHash: bounty.transactionHash,
    updateTransactionHash:
      bounty.updateTransactionHash || bounty.transactionHash,
    createTimestamp: bounty.createTimestamp,
    updateTimestamp: bounty.updateTimestamp || bounty.createTimestamp,
    bountyId: bounty.bountyId,
    proposalId: bounty.proposalId,
    daoId: bounty.daoId,
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
