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
  createTimestamp: number;
  replies: number;

  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          title: { type: 'text' },
          daoId: { type: 'keyword' },
          proposer: { type: 'keyword' },
          state: { type: 'keyword' },
          type: { type: 'keyword' },
          createTimestamp: { type: 'long' },
        },
      },
    };
  }
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
    createdAt,
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
    createTimestamp: new Date(createdAt).getTime(),
    indexedBy: 'astro-api',
  };

  return dto;
}
