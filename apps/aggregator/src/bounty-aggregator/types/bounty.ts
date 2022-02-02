import camelcaseKeys from 'camelcase-keys';
import {
  btoaJSON,
  buildBountyClaimId,
  buildBountyId,
  calculateClaimEndTime,
} from '@sputnik-v2/utils';
import { Transaction } from '@sputnik-v2/near-indexer';
import { Dao } from '@sputnik-v2/dao';
import {
  castProposalKind,
  ProposalKindAddBounty,
  ProposalType,
} from '@sputnik-v2/proposal';

export function castBountyClaim(
  dao: Dao,
  bountyClaimTxs: Transaction[],
  bounty,
  claim,
) {
  const claimDto = {
    ...claim,
    endTime: calculateClaimEndTime(claim.startTime, claim.deadline),
    id: buildBountyClaimId(dao.id, bounty.id, claim.startTime),
    bounty: {
      id: buildBountyId(dao.id, bounty.id),
      bountyId: bounty.id,
    },
  };
  const txCreateData = bountyClaimTxs.find((tx) => {
    const { signerAccountId } = tx;
    const { id: txId, deadline: txDeadline } =
      btoaJSON(String(tx.transactionAction?.args?.args_base64)) || {};

    return (
      signerAccountId === claimDto.accountId &&
      bounty.id === txId &&
      claimDto.deadline === txDeadline
    );
  });

  return {
    ...claimDto,
    transactionHash: txCreateData?.transactionHash,
    createTimestamp: txCreateData?.blockTimestamp,
  };
}

export function castBounty(
  dao: Dao,
  txs: Transaction[],
  bounty,
  claims,
  bountyEntity,
) {
  const bountyDto = {
    ...camelcaseKeys(bounty),
    id: buildBountyId(dao.id, bounty.id),
    bountyId: bounty.id,
    daoId: dao.id,
    dao: { id: dao.id },
  };
  const bountyClaimTxs = txs.filter(
    ({ transactionAction }) =>
      transactionAction?.args?.method_name == 'bounty_claim',
  );
  const txData = txs.filter(({ transactionAction }) => {
    const { kind: txKind } =
      btoaJSON(String(transactionAction?.args?.args_base64))?.proposal || {};
    const txProposalKind = castProposalKind(txKind);
    const { type } = txProposalKind?.kind || {};

    if (ProposalType.AddBounty !== type) {
      return false;
    }

    const {
      amount: txAmount,
      description: txDescription,
      times: txTimes,
      maxDeadline: txMaxDeadline,
      token: txToken,
    } = (txProposalKind.kind as ProposalKindAddBounty)?.bounty || {};

    return (
      bountyDto.amount === txAmount &&
      bountyDto.description === txDescription &&
      bountyDto.times === txTimes &&
      bountyDto.maxDeadline === txMaxDeadline &&
      bountyDto.token === txToken
    );
  });
  const txCreateData = txData[0];
  const txUpdateData = txData[txData.length - 1];
  const bountyClaims = claims
    .filter((claim) => bountyDto.bountyId === claim.bounty_id)
    .map((claim) =>
      castBountyClaim(dao, bountyClaimTxs, bounty, camelcaseKeys(claim)),
    );

  return {
    ...bountyDto,
    bountyClaims: bountyEntity?.bountyClaims
      ? bountyEntity.bountyClaims.concat(bountyClaims)
      : bountyClaims,
    transactionHash: txCreateData?.transactionHash,
    createTimestamp: txCreateData?.blockTimestamp,
    updateTransactionHash: txUpdateData?.transactionHash,
    updateTimestamp: txUpdateData?.blockTimestamp,
  };
}
