import { Bounty } from '@sputnik-v2/bounty';
import { ProposalStatus } from '@sputnik-v2/proposal';

import {
  ProposalOpensearchDto,
  mapProposalToOpensearchDto,
  BaseOpensearchDto,
} from '.';

export class BountyOpensearchDto extends BaseOpensearchDto {
  id: string;
  bountyId: number;
  daoId: string;
  proposalId: string;
  description: string;
  token: string;
  amount: string;
  times: number;
  maxDeadline: string;
  numberOfClaims: number;
  commentsCount: number;
  proposalStatus: ProposalStatus;
  proposal: ProposalOpensearchDto;
  bountyDoneProposals: string;
  bountyClaims: string;
  transactionHash: string;
  createTimestamp: string; // nanoseconds
  tags?: string[];

  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          createTimestamp: { type: 'long' },
          daoId: { type: 'keyword' },
          numberOfClaims: { type: 'integer' },
          bountyId: { type: 'integer' },
          proposalStatus: { type: 'keyword' },
          tags: { type: 'text' },
        },
      },
    };
  }
}

export function mapBountyToOpensearchDto(bounty: Bounty): BountyOpensearchDto {
  const {
    id,
    bountyId,
    daoId,
    proposalId,
    description,
    token,
    times,
    maxDeadline,
    numberOfClaims,
    transactionHash,
    createTimestamp,
    amount,
    bountyClaims,
    bountyContext,
    bountyDoneProposals,
  } = bounty;
  const { proposal, commentsCount } = bountyContext || {};
  const { proposer, votes } = proposal || {};

  const accountIds = [
    ...bountyClaims.map((claim) => claim.accountId),
    ...([proposer] || []),
    ...(votes ? Object.keys(votes) : []),
    ...bountyDoneProposals?.map(({ proposer, votes }) => [
      proposer,
      ...Object.keys(votes),
    ]),
  ];

  const dto: BountyOpensearchDto = {
    id,
    name: id,
    accounts: [...new Set(accountIds)].join(' '),
    bountyId,
    daoId,
    proposalId,
    description,
    token,
    times,
    maxDeadline,
    numberOfClaims,
    amount,
    bountyClaims: JSON.stringify(bountyClaims),
    bountyDoneProposals: JSON.stringify(bountyDoneProposals),
    transactionHash,
    createTimestamp,
    proposalStatus: proposal.status,
    proposal: proposal ? mapProposalToOpensearchDto(proposal) : null,
    commentsCount,
    indexedBy: 'astro-api',
  };

  return dto;
}
