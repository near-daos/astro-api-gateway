import { Bounty } from '@sputnik-v2/bounty';

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
  times: string;
  maxDeadline: string;
  numberOfClaims: number;
  commentsCount: number;
  proposal: ProposalOpensearchDto;
  bountyDoneProposals: string;
  bountyClaims: string;
  transactionHash: string;
  createTimestamp: number;

  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          createTimestamp: { type: 'long' },
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
    proposal: proposal ? mapProposalToOpensearchDto(proposal) : null,
    commentsCount,
    indexedBy: 'astro-api',
  };

  return dto;
}
