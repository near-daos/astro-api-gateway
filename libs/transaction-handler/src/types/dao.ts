import { DaoModel, PartialEntity } from '@sputnik-v2/dynamodb';
import {
  isSputnikDaoPolicyV2,
  SputnikDaoConfig,
  SputnikDaoPolicy,
} from '@sputnik-v2/near-api';
import { DaoInfo } from '@sputnik-v2/sputnikdao';
import { Dao, DaoStatus, PolicyDtoV1, RoleKindType } from '@sputnik-v2/dao';
import { SputnikDaoDto } from '@sputnik-v2/dao/dto';
import { btoaJSON, buildRoleId } from '@sputnik-v2/utils';
import { DaoPolicyModel } from '@sputnik-v2/dynamodb';

import { castRolePermission } from './role';
import { castVotePolicy } from './vote-policy';

export function castDaoPolicy(
  daoId: string,
  daoPolicy: SputnikDaoPolicy,
  delegationAccounts = [],
): Pick<
  SputnikDaoDto,
  | 'council'
  | 'councilSeats'
  | 'numberOfMembers'
  | 'numberOfGroups'
  | 'accountIds'
  | 'policy'
> {
  if (!isSputnikDaoPolicyV2(daoPolicy)) {
    throw new Error(`Invalid sputnik dao policy: ${JSON.stringify(daoPolicy)}`);
  }
  const roles = daoPolicy.roles.map((role) => ({
    ...castRolePermission(role),
    id: buildRoleId(daoId, role.name),
    policy: { daoId },
  }));
  const groups = roles.filter((role) => role.kind === RoleKindType.Group);
  const council = groups
    .filter(({ name }) => 'council' === name.toLowerCase())
    .map(({ accountIds }) => accountIds)
    .flat();
  const accountIds = [
    ...new Set(
      groups
        .map((role) => role.accountIds)
        .flat()
        .concat(delegationAccounts),
    ),
  ].filter((accountId) => accountId);
  const numberOfMembers = accountIds.length;
  const numberOfGroups = groups.length;

  return {
    council,
    councilSeats: council.length,
    numberOfMembers,
    numberOfGroups,
    accountIds,
    policy: {
      daoId,
      roles,
      proposalBond: daoPolicy.proposal_bond,
      proposalPeriod: daoPolicy.proposal_period,
      bountyBond: daoPolicy.bounty_bond,
      bountyForgivenessPeriod: daoPolicy.bounty_forgiveness_period,
      defaultVotePolicy: castVotePolicy(daoPolicy.default_vote_policy),
    },
  };
}

export function castCreateDao(
  signerId: string,
  transactionHash: string,
  daoId: string,
  daoInfo: DaoInfo,
  delegationAccounts: string[],
  timestamp: string,
): SputnikDaoDto {
  return {
    id: daoId,
    config: daoInfo.config,
    ...castDaoPolicy(daoId, daoInfo.policy, delegationAccounts),
    metadata: btoaJSON(daoInfo.config.metadata),
    amount: daoInfo.amount,
    status: DaoStatus.Active,
    totalSupply: daoInfo.totalSupply,
    lastBountyId: daoInfo.lastBountyId,
    lastProposalId: daoInfo.lastProposalId,
    stakingContract: daoInfo.stakingContract,
    numberOfAssociates: 0,
    link: '',
    description: '',
    createdBy: signerId,
    transactionHash: transactionHash,
    updateTransactionHash: transactionHash,
    createTimestamp: timestamp,
    updateTimestamp: timestamp,
  };
}

// dynamo compatibility
export function castDynamoDaoPolicy(
  daoId: string,
  policy: PolicyDtoV1 | DaoPolicyModel,
): PolicyDtoV1 {
  return {
    daoId,
    ...policy,
  };
}

export function castAddProposalDao(
  dao: Dao | PartialEntity<DaoModel>,
  lastProposalId: number,
  transactionHash: string,
  timestamp: string,
): SputnikDaoDto {
  return {
    id: dao.id,
    config: dao.config,
    policy: castDynamoDaoPolicy(dao.id, dao.policy),
    council: dao.council,
    councilSeats: dao.councilSeats,
    metadata: dao.metadata,
    amount: dao.amount,
    status: dao.status,
    totalSupply: dao.totalSupply,
    lastBountyId: dao.lastBountyId,
    lastProposalId: Number(lastProposalId),
    stakingContract: dao.stakingContract,
    numberOfGroups: dao.numberOfGroups,
    numberOfMembers: dao.numberOfMembers,
    numberOfAssociates: dao.numberOfAssociates,
    accountIds: dao.accountIds,
    link: dao.link,
    description: dao.description,
    createdBy: dao.createdBy,
    transactionHash: dao.transactionHash,
    updateTransactionHash: transactionHash,
    createTimestamp: dao.createTimestamp,
    updateTimestamp: timestamp,
  };
}

export function castActProposalDao({
  dao,
  transactionHash,
  amount,
  config,
  policy,
  lastBountyId,
  stakingContract,
  delegationAccounts,
  timestamp,
}: {
  dao: Dao | PartialEntity<DaoModel>;
  transactionHash: string;
  amount: string;
  config?: SputnikDaoConfig;
  policy?: SputnikDaoPolicy;
  lastBountyId?: number;
  stakingContract?: string;
  delegationAccounts?: string[];
  timestamp: string;
}): SputnikDaoDto {
  const daoPolicy = policy
    ? castDaoPolicy(dao.id, policy, delegationAccounts)
    : {
        council: dao.council,
        councilSeats: dao.councilSeats,
        numberOfGroups: dao.numberOfGroups,
        numberOfMembers: dao.numberOfMembers,
        accountIds: dao.accountIds,
        policy: castDynamoDaoPolicy(dao.id, dao.policy),
      };

  return {
    id: dao.id,
    config: config ?? dao.config,
    ...daoPolicy,
    metadata: dao.metadata,
    amount: amount ?? dao.amount,
    status: dao.status,
    totalSupply: dao.totalSupply,
    lastBountyId: lastBountyId ?? dao.lastBountyId,
    lastProposalId: dao.lastProposalId,
    stakingContract: stakingContract ?? dao.stakingContract,
    numberOfAssociates: dao.numberOfAssociates,
    link: dao.link,
    description: dao.description,
    createdBy: dao.createdBy,
    transactionHash: dao.transactionHash,
    updateTransactionHash: transactionHash,
    createTimestamp: dao.createTimestamp,
    updateTimestamp: timestamp,
  };
}
