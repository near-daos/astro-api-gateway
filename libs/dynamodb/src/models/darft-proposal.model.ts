import { ProposalKind, ProposalType } from '@sputnik-v2/proposal';
import {
  DraftProposal,
  DraftProposalHistory,
  DraftProposalState,
} from '@sputnik-v2/draft-proposal';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

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
  history: Partial<DraftProposalHistoryModel>[];
  createTimestamp: number;
  processingTimeStamp: number;
}

export class DraftProposalHistoryModel {
  id: string;
  daoId: string;
  proposer: string;
  title: string;
  description: string;
  kind: ProposalKind;
  type: ProposalType;
  timestamp: number;
}

export function mapDraftProposalToDraftProposalModel(
  draftProposal: DraftProposal,
  history?: DraftProposalHistory[],
): DraftProposalModel {
  return {
    partitionId: draftProposal.daoId,
    entityId: buildEntityId(
      DynamoEntityType.DraftProposal,
      String(draftProposal.id),
    ),
    entityType: DynamoEntityType.DraftProposal,
    isArchived: draftProposal.isArchived,
    createTimestamp: draftProposal.createdAt.getTime(),
    processingTimeStamp: draftProposal.updatedAt.getTime(),
    id: draftProposal.id.toString(),
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
      : [],
  };
}

export function mapDraftProposalHistoryToDraftProposalHistoryModel(
  draftProposalHistory: DraftProposalHistory,
): Partial<DraftProposalHistoryModel> {
  return {
    id: draftProposalHistory.id.toString(),
    daoId: draftProposalHistory.daoId,
    proposer: draftProposalHistory.proposer,
    title: draftProposalHistory.title,
    description: draftProposalHistory.description,
    kind: draftProposalHistory.kind,
    type: draftProposalHistory.type,
    timestamp: new Date(draftProposalHistory.date).getTime(),
  };
}
