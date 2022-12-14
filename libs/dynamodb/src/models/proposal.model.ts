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
import { DynamoEntityType, PartialEntity } from '../types';

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
  submissionTime: string;
  voteCounts: Record<string, number[]>;
  votes: Record<string, Vote>;
  failure: Record<string, any>;
  actions: ProposalActionModel[];
  votePeriodEnd: string;
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
  timestamp: string; // nanoseconds
}

export function mapProposalDtoToProposalModel(
  proposal: Partial<ProposalDto>,
): PartialEntity<ProposalModel> {
  return {
    partitionId: proposal.daoId,
    entityId: buildEntityId(
      DynamoEntityType.Proposal,
      String(proposal.proposalId),
    ),
    entityType: DynamoEntityType.Proposal,
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    transactionHash: proposal.transactionHash,
    updateTransactionHash: proposal.updateTransactionHash,
    createTimestamp: proposal.createTimestamp,
    updateTimestamp: proposal.updateTimestamp,
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

export function mapProposalToProposalModel(
  proposal: Partial<Proposal>,
): PartialEntity<ProposalModel> {
  return {
    partitionId: proposal.daoId,
    entityId: buildEntityId(
      DynamoEntityType.Proposal,
      String(proposal.proposalId),
    ),
    entityType: DynamoEntityType.Proposal,
    isArchived: !!proposal.isArchived,
    createdAt: proposal.createdAt ? proposal.createdAt.getTime() : undefined,
    updatedAt: proposal.updatedAt ? proposal.updatedAt.getTime() : undefined,
    transactionHash: proposal.transactionHash,
    updateTransactionHash: proposal.updateTransactionHash,
    createTimestamp: proposal.createTimestamp,
    updateTimestamp: proposal.updateTimestamp,
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
