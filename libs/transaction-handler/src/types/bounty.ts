import camelcaseKeys from 'camelcase-keys';
import { BountyDto, BountyClaimDto } from '@sputnik-v2/bounty/dto';
import {
  buildBountyClaimId,
  buildBountyId,
  getBlockTimestamp,
} from '@sputnik-v2/utils';

export function castAddBounty({
  dao,
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
  transactionHash,
  bountyClaims,
  numberOfClaims,
  timestamp = getBlockTimestamp(),
}): BountyDto {
  const claims = castBountyClaims({
    contractId: bounty.dao.id,
    accountId,
    bountyId: bounty.bountyId,
    bountyClaims,
  });

  return {
    ...bounty,
    bountyClaims: bounty.bountyClaims
      ? bounty.bountyClaims
          .filter((claim) => claim.accountId !== accountId)
          .concat(claims)
      : claims,
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
      ? bounty.bountyClaims
          .filter((claim) => claim.accountId !== accountId)
          .concat(claims)
      : claims,
    numberOfClaims: numberOfClaims,
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}
