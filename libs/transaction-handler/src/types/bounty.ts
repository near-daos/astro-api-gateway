import camelcaseKeys from 'camelcase-keys';
import { BountyDto, BountyClaimDto } from '@sputnik-v2/bounty/dto';
import {
  buildBountyClaimId,
  buildBountyId,
  calculateClaimEndTime,
  getBlockTimestamp,
} from '@sputnik-v2/utils';

export function castAddBounty({
  dao,
  proposal,
  bounty,
  bountyId,
  transactionHash,
  timestamp = getBlockTimestamp(),
}): BountyDto {
  return {
    ...camelcaseKeys(bounty),
    id: buildBountyId(dao.id, bountyId),
    bountyId: bountyId,
    daoId: dao.id,
    proposalId: proposal.id,
    dao: { id: dao.id },
    numberOfClaims: 0,
    bountyClaims: [],
    transactionHash: transactionHash,
    createTimestamp: timestamp,
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}

export function castBountyClaims({
  contractId,
  accountId,
  bountyId,
  bountyClaims,
}): BountyClaimDto[] {
  return bountyClaims
    .map((bountyClaim) => {
      const claim = camelcaseKeys(bountyClaim);
      return {
        ...claim,
        endTime: calculateClaimEndTime(claim.startTime, claim.deadline),
        id: buildBountyClaimId(contractId, claim.bountyId, claim.startTime),
        accountId,
        bounty: {
          id: buildBountyId(contractId, claim.bountyId),
          bountyId: claim.bountyId,
        },
      };
    })
    .filter((claim) => bountyId === claim.bountyId);
}

export function castClaimBounty({
  bounty,
  accountId,
  daoId,
  transactionHash,
  bountyClaims,
  numberOfClaims,
  removedClaim,
  timestamp = getBlockTimestamp(),
}): BountyDto {
  const claims = castBountyClaims({
    contractId: bounty.dao?.id || daoId,
    accountId,
    bountyId: bounty.bountyId,
    bountyClaims,
  });
  const filteredClaims = removedClaim
    ? bounty.bountyClaims.filter((claim) => claim.id !== removedClaim?.id)
    : bounty.bountyClaims;

  return {
    ...bounty,
    daoId: bounty.dao?.id || daoId,
    bountyClaims: filteredClaims ? filteredClaims.concat(claims) : claims,
    numberOfClaims: numberOfClaims,
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}

export function castDoneBounty({
  dao,
  accountId,
  bounty,
  bountyData,
  numberOfClaims,
  bountyClaims,
  transactionHash,
  timestamp = getBlockTimestamp(),
}): BountyDto {
  const claims = castBountyClaims({
    contractId: dao.id,
    accountId,
    bountyId: bounty.bountyId,
    bountyClaims,
  });
  return {
    ...bounty,
    times: bountyData.times,
    bountyClaims: bounty.bountyClaims
      ? bounty.bountyClaims.concat(claims)
      : claims,
    numberOfClaims: numberOfClaims,
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}
