import { ProposalKind, ProposalType } from '@sputnik-v2/proposal';
import {
  DraftProposal,
  DraftProposalHistory,
  DraftProposalState,
} from '@sputnik-v2/draft-proposal';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb';

export class DraftProposalModel extends BaseModel {
  id: string;
  proposalId?: string;
  proposer: string;
  title: string;
  description: string;
  kind: ProposalKind;
  type: ProposalType;
  state: DraftProposalState;
  viewAccounts: string[];
  saveAccounts: string[];
  replies: number;
  history: DraftProposalHistoryModel[];
}

export class DraftProposalHistoryModel {
  id: string;
  daoId: string;
  proposer: string;
  title: string;
  description: string;
  kind: ProposalKind;
  type: ProposalType;
  date: Date;
}

export function mapDraftProposalToDraftProposalModel(
  draftProposal: DraftProposal,
  history?: DraftProposalHistory[],
): DraftProposalModel {
  return {
    partitionId: draftProposal.daoId,
    entityId: `${DynamoEntityType.DraftProposal}:${draftProposal.id}`,
    entityType: DynamoEntityType.DraftProposal,
    isArchived: draftProposal.isArchived,
    id: draftProposal.id,
    proposalId: draftProposal.proposalId,
    proposer: draftProposal.proposer,
    title: draftProposal.title,
    description: draftProposal.description,
    kind: draftProposal.kind,
    type: draftProposal.type,
    state: draftProposal.state,
    viewAccounts: draftProposal.viewAccounts,
    saveAccounts: draftProposal.saveAccounts,
    replies: draftProposal.replies,
    history: history?.length
      ? history.map(mapDraftProposalHistoryToDraftProposalHistoryModel)
      : undefined,
  };
}

export function mapDraftProposalHistoryToDraftProposalHistoryModel(
  draftProposalHistory: DraftProposalHistory,
): DraftProposalHistoryModel {
  return {
    id: draftProposalHistory.id,
    daoId: draftProposalHistory.daoId,
    proposer: draftProposalHistory.proposer,
    title: draftProposalHistory.title,
    description: draftProposalHistory.description,
    kind: draftProposalHistory.kind,
    type: draftProposalHistory.type,
    date: draftProposalHistory.date,
  };
}
