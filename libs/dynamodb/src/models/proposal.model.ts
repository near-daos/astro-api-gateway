import {
  Action,
  Proposal,
  ProposalAction,
  ProposalDto,
  ProposalKind,
  ProposalPolicyLabel,
  ProposalStatus,
  ProposalType,
  ProposalVoteStatus,
} from '@sputnik-v2/proposal';
import { Vote } from '@sputnik-v2/sputnikdao';
import { buildEntityId } from '@sputnik-v2/utils';
import { TransactionModel } from './transaction.model';
import { DynamoEntityType } from '../types';

export class ProposalModel extends TransactionModel {
  id: string;
  proposalId: number;
  proposer: string;
  description: string;
  status: ProposalStatus;
  voteStatus: ProposalVoteStatus;
  kind: ProposalKind;
  type: ProposalType;
  policyLabel: ProposalPolicyLabel;
  submissionTime: number;
  voteCounts: Record<string, number[]>;
  votes: Record<string, Vote>;
  failure: Record<string, any>;
  actions: ProposalActionModel[];
  votePeriodEnd: number;
  commentsCount: number;
  bountyDoneId?: string;
  bountyClaimId?: string;
}

export class ProposalActionModel {
  id: string;
  proposalId: string;
  accountId: string;
  action: Action;
  transactionHash: string;
  timestamp: number;
}

export function mapProposalDtoToProposalModel(
  proposal: ProposalDto,
): ProposalModel {
  return {
    partitionId: proposal.daoId,
    entityId: buildEntityId(
      DynamoEntityType.Proposal,
      String(proposal.proposalId),
    ),
    entityType: DynamoEntityType.Proposal,
    isArchived: false,
    createTimestamp: Date.now(),
    processingTimeStamp: Date.now(),
    transactionHash: proposal.transactionHash,
    updateTransactionHash: proposal.updateTransactionHash,
    createBlockTimestamp: proposal.createTimestamp,
    updateBlockTimestamp: proposal.updateTimestamp,
    id: proposal.id,
    proposalId: proposal.proposalId,
    proposer: proposal.proposer,
    description: proposal.description,
    status: proposal.status,
    voteStatus: ProposalVoteStatus.Active,
    kind: proposal.kind.kind,
    type: proposal.type,
    policyLabel: proposal.policyLabel,
    submissionTime: proposal.submissionTime,
    voteCounts: proposal.voteCounts,
    votes: proposal.votes,
    failure: proposal.failure,
    actions: proposal.actions
      ? proposal.actions.map(mapProposalActionToProposalActionModel)
      : [],
    votePeriodEnd: proposal.votePeriodEnd,
    commentsCount: 0,
    bountyDoneId: proposal.bountyDoneId,
    bountyClaimId: proposal.bountyClaimId,
  };
}

export function mapProposalToProposalModel(proposal: Proposal): ProposalModel {
  return {
    partitionId: proposal.daoId,
    entityId: buildEntityId(
      DynamoEntityType.Proposal,
      String(proposal.proposalId),
    ),
    entityType: DynamoEntityType.Proposal,
    isArchived: proposal.isArchived,
    createTimestamp: proposal.createdAt.getTime(),
    processingTimeStamp: proposal.updatedAt.getTime(),
    transactionHash: proposal.transactionHash,
    updateTransactionHash: proposal.updateTransactionHash,
    createBlockTimestamp: proposal.createTimestamp,
    updateBlockTimestamp: proposal.updateTimestamp,
    id: proposal.id,
    proposalId: proposal.proposalId,
    proposer: proposal.proposer,
    description: proposal.description,
    status: proposal.status,
    voteStatus: proposal.voteStatus,
    kind: proposal.kind,
    type: proposal.type,
    policyLabel: proposal.policyLabel,
    submissionTime: proposal.submissionTime,
    voteCounts: proposal.voteCounts,
    votes: proposal.votes,
    failure: proposal.failure,
    actions: proposal.actions
      ? proposal.actions.map(mapProposalActionToProposalActionModel)
      : [],
    votePeriodEnd: proposal.votePeriodEnd,
    commentsCount: proposal.commentsCount,
    bountyDoneId: proposal.bountyDoneId,
    bountyClaimId: proposal.bountyClaimId,
  };
}

export function mapProposalActionToProposalActionModel(
  proposalAction: ProposalAction,
): ProposalActionModel {
  return {
    id: proposalAction.id,
    proposalId: proposalAction.proposalId,
    accountId: proposalAction.accountId,
    action: proposalAction.action,
    transactionHash: proposalAction.transactionHash,
    timestamp: proposalAction.timestamp,
  };
}
