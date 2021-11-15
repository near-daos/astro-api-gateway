import camelcaseKeys from 'camelcase-keys';
import { BountyDto, BountyClaimDto } from '@sputnik-v2/bounty/dto';
import {
  buildBountyClaimId,
  buildBountyId,
  getBlockTimestamp,
} from '@sputnik-v2/utils';

export function castAddBounty({
  dao,
  proposal,
  transactionHash,
  timestamp = getBlockTimestamp(),
}): BountyDto {
  return {
    ...camelcaseKeys(proposal.kind?.kind.bounty),
    id: buildBountyId(dao.id, dao.lastBountyId),
    bountyId: dao.lastBountyId,
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
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}
