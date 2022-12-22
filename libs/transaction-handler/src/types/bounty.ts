import { Bounty, BountyClaim } from '@sputnik-v2/bounty';
import { Dao } from '@sputnik-v2/dao';
import {
  BountyClaimModel,
  BountyModel,
  DaoModel,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import {
  SputnikDaoBountyClaim,
  SputnikDaoBountyOutput,
} from '@sputnik-v2/near-api';
import { ProposalDto } from '@sputnik-v2/proposal';
import { BountyDto, BountyClaimDto } from '@sputnik-v2/bounty/dto';
import {
  arrayUniqueBy,
  buildBountyClaimId,
  buildBountyId,
  calculateClaimEndTime,
} from '@sputnik-v2/utils';

export function castAddBounty(
  dao: Dao | PartialEntity<DaoModel>,
  proposal: ProposalDto,
  bountyData: Bounty,
  bountyId: number,
  transactionHash: string,
  timestamp: string,
): BountyDto {
  return {
    id: buildBountyId(dao.id, bountyId),
    daoId: dao.id,
    bountyId: bountyId,
    proposalId: proposal.id,
    proposalIndex: proposal.proposalId,
    description: bountyData.description,
    token: bountyData.token,
    amount: bountyData.amount,
    times: bountyData.times,
    maxDeadline: bountyData.maxDeadline,
    numberOfClaims: 0,
    bountyClaims: [],
    transactionHash: transactionHash,
    createTimestamp: timestamp,
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}

export function castBountyClaims(
  daoId: string,
  accountId: string,
  bountyId: number,
  bountyClaims: SputnikDaoBountyClaim[],
): BountyClaimDto[] {
  return bountyClaims
    .filter((claim) => bountyId === claim.bounty_id)
    .map((claim) => {
      return {
        id: buildBountyClaimId(daoId, claim.bounty_id, claim.start_time),
        bountyId: buildBountyId(daoId, claim.bounty_id),
        accountId,
        deadline: claim.deadline,
        startTime: claim.start_time,
        endTime: calculateClaimEndTime(claim.start_time, claim.deadline),
        completed: claim.completed,
      };
    });
}

export function castClaimBounty(
  bounty: Bounty | PartialEntity<BountyModel>,
  accountId: string,
  daoId: string,
  transactionHash: string,
  bountyClaims: SputnikDaoBountyClaim[],
  numberOfClaims: number,
  removedClaim: BountyClaim | BountyClaimModel | undefined,
  timestamp: string,
): BountyDto {
  const claims = castBountyClaims(
    daoId,
    accountId,
    bounty.bountyId,
    bountyClaims,
  );
  const bountyClaimDtos = (bounty.bountyClaims || [])
    .map((claim) => castBountyClaim(bounty.id, claim))
    .concat(claims);

  const filteredClaims = removedClaim
    ? bountyClaimDtos.filter((claim) => claim.id !== removedClaim?.id)
    : bountyClaimDtos;

  return {
    id: bounty.id,
    daoId: bounty.daoId || daoId,
    bountyId: bounty.bountyId,
    proposalId: bounty.proposalId,
    proposalIndex:
      (bounty as PartialEntity<BountyModel>).proposalIndex ??
      parseProposalIndex(bounty.proposalId), // Bounty entity does not have proposalIndex
    description: bounty.description,
    token: bounty.token,
    amount: bounty.amount,
    times: bounty.times,
    maxDeadline: bounty.maxDeadline,
    numberOfClaims: numberOfClaims,
    bountyClaims: arrayUniqueBy<BountyClaimDto>(filteredClaims, 'id'),
    createTimestamp: bounty.createTimestamp,
    transactionHash: bounty.transactionHash,
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}

export function castDoneBounty(
  dao: Dao | PartialEntity<DaoModel>,
  accountId: string,
  bounty: Bounty | PartialEntity<BountyModel>,
  bountyData: SputnikDaoBountyOutput,
  numberOfClaims: number,
  bountyClaims: SputnikDaoBountyClaim[],
  transactionHash: string,
  timestamp: string,
): BountyDto {
  const claims = castBountyClaims(
    dao.id,
    accountId,
    bounty.bountyId,
    bountyClaims,
  );
  const bountyClaimDtos = (bounty.bountyClaims || [])
    .map((claim) => castBountyClaim(bounty.id, claim))
    .concat(claims);

  function isBounty(
    _bounty: Bounty | PartialEntity<BountyModel>,
  ): _bounty is Bounty {
    return (_bounty as Bounty).bountyDoneProposals !== undefined;
  }

  return {
    id: bounty.id,
    daoId: bounty.daoId || dao.id,
    bountyId: bounty.bountyId,
    proposalId: bounty.proposalId,
    proposalIndex: parseProposalIndex(bounty.proposalId),
    description: bounty.description,
    token: bounty.token,
    amount: bounty.amount,
    times: bountyData.times,
    maxDeadline: bounty.maxDeadline,
    numberOfClaims: numberOfClaims,
    bountyClaims: arrayUniqueBy<BountyClaimDto>(bountyClaimDtos, 'id'),
    createTimestamp: bounty.createTimestamp,
    updateTimestamp: timestamp,
    transactionHash: bounty.transactionHash,
    updateTransactionHash: transactionHash,
    bountyDoneProposalIds: isBounty(bounty)
      ? bounty.bountyDoneProposals.map((item) => String(item.proposalId))
      : bounty.bountyDoneProposalIds,
  };
}

// dynamo compatibility
export function parseProposalIndex(proposalId: string): number {
  const proposalIndex = parseInt(proposalId.split('-').pop());
  if (isNaN(proposalIndex)) {
    throw new Error(`Invalid proposal ID format: ${proposalId}`);
  }
  return proposalIndex;
}

// dynamo compatibility
export function castBountyClaim(
  bountyId: string,
  bountyClaim: BountyClaim | BountyClaimModel,
): BountyClaimDto {
  return {
    ...bountyClaim,
    bountyId,
  };
}
