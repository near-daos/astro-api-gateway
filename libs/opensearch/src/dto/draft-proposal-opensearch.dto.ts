import { DraftProposal, DraftProposalState } from '@sputnik-v2/draft-proposal';
import { ProposalType } from '@sputnik-v2/proposal';

import { BaseOpensearchDto } from './base-opensearch.dto';

export class DraftProposalOpensearchDto extends BaseOpensearchDto {
  id: string;
  daoId: string;
  proposalId: string;
  proposer: string;
  title: string;
  description: string;
  type: ProposalType;
  state: DraftProposalState;
  replies: number;
}

export function mapDraftProposalToOpensearchDto(
  draftProposal: DraftProposal,
): DraftProposalOpensearchDto {
  const {
    id,
    daoId,
    proposalId,
    description,
    title,
    type,
    state,
    proposer,
    replies,
  } = draftProposal;

  const dto: DraftProposalOpensearchDto = {
    id,
    name: title,
    description,
    accounts: proposer,
    title,
    daoId,
    proposalId: typeof proposalId === 'number' ? `${proposalId}` : proposalId,
    type,
    state,
    proposer,
    replies,
    indexedBy: 'nodejs',
  };

  return dto;
}
