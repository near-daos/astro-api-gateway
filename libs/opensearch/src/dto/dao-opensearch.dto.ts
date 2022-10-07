import { Dao, DaoConfig, DaoStatus, Delegation } from '@sputnik-v2/dao';

import { BaseOpensearchDto } from './base-opensearch.dto';

export class DaoOpensearchDto extends BaseOpensearchDto {
  id: string;
  config: DaoConfig;
  metadata: string;
  amount: number;
  totalSupply: string;
  lastBountyId: number;
  lastProposalId: number;
  stakingContract: string;
  numberOfAssociates: number;
  numberOfMembers: number;
  numberOfGroups: number;
  council: string[];
  accountIds: string[];
  councilSeats: number;
  policy: string;
  link: string;
  description: string;
  createdBy: string;
  daoVersionHash: string;
  status: DaoStatus;
  activeProposalCount: number;
  totalProposalCount: number;
  totalDaoFunds: number;
  delegations?: DelegationOpensearchDto[];
  transactionHash: string;
  createTimestamp: number;
}

export class DelegationOpensearchDto {
  id: string;
  daoId: string;
  accountId: string;
  balance: string;
  delegators: string;
}

export function mapDaoToOpensearchDto(dao: Dao): DaoOpensearchDto {
  const {
    id,
    config,
    metadata,
    amount,
    totalSupply,
    lastBountyId,
    lastProposalId,
    stakingContract,
    numberOfAssociates,
    numberOfMembers,
    numberOfGroups,
    council,
    accountIds,
    councilSeats,
    policy,
    link,
    description,
    createdBy,
    daoVersionHash,
    status,
    activeProposalCount,
    totalProposalCount,
    totalDaoFunds,
    delegations,
    transactionHash,
    createTimestamp,
  } = dao;

  const dto: DaoOpensearchDto = {
    id,
    name: id,
    accounts: [...new Set(accountIds)].join(' '),
    config,
    metadata: JSON.stringify(metadata),
    amount,
    totalSupply,
    lastBountyId,
    lastProposalId,
    stakingContract,
    numberOfAssociates,
    numberOfMembers,
    numberOfGroups,
    council,
    accountIds,
    councilSeats,
    policy: JSON.stringify(policy),
    link,
    description,
    createdBy,
    daoVersionHash,
    status,
    activeProposalCount,
    totalProposalCount,
    totalDaoFunds,
    delegations: delegations?.map((delegation) =>
      mapDelegationToOpensearchDto(delegation),
    ),
    transactionHash,
    createTimestamp,
  };

  return dto;
}

export function mapDelegationToOpensearchDto(
  delegation: Delegation,
): DelegationOpensearchDto {
  const { id, accountId, daoId, delegators, balance } = delegation;

  return {
    id,
    accountId,
    daoId,
    delegators: JSON.stringify(delegators),
    balance,
  };
}
