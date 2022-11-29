import { DaoInfo } from '@sputnik-v2/sputnikdao';
import { castDaoPolicy } from '@sputnik-v2/transaction-handler';
import { SputnikDaoDto } from '@sputnik-v2/dao';
import { Account, Transaction } from '@sputnik-v2/near-indexer';
import { btoaJSON } from '@sputnik-v2/utils';

export function castDao(
  daoAccount: Account,
  txs: Transaction[],
  {
    config,
    policy,
    stakingContract,
    totalSupply,
    lastProposalId,
    lastBountyId,
    amount,
  }: DaoInfo,
  delegationAccounts?: string[],
): SputnikDaoDto {
  const txUpdate = txs[txs.length - 1];
  return {
    id: daoAccount.accountId,
    ...castDaoPolicy(daoAccount.accountId, policy, delegationAccounts),
    config,
    metadata: btoaJSON(config.metadata),
    stakingContract,
    totalSupply,
    lastProposalId,
    lastBountyId,
    amount: Number(amount),
    link: '',
    description: '',
    transactionHash:
      daoAccount.receipt?.originatedFromTransaction?.transactionHash,
    createTimestamp: daoAccount.receipt?.includedInBlockTimestamp,
    createdBy: daoAccount.receipt?.originatedFromTransaction?.signerAccountId,
    updateTransactionHash: txUpdate?.transactionHash,
    updateTimestamp: txUpdate?.blockTimestamp,
    numberOfAssociates: new Set(
      txs.map(({ signerAccountId }) => signerAccountId),
    ).size,
  };
}

export function castDaoById(
  daoId: string,
  {
    config,
    policy,
    stakingContract,
    totalSupply,
    lastProposalId,
    lastBountyId,
    amount,
  }: DaoInfo,
  delegationAccounts: string[],
): Partial<SputnikDaoDto> {
  return {
    id: daoId,
    ...castDaoPolicy(daoId, policy, delegationAccounts),
    config,
    metadata: btoaJSON(config.metadata),
    stakingContract,
    totalSupply,
    lastProposalId,
    lastBountyId,
    amount: Number(amount),
  };
}
