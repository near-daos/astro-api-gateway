import { DaoConfig, DaoStatus, VotePolicy } from '@sputnik-v2/dao/types';
import {
  Dao,
  DaoVersion,
  Delegation,
  Policy,
  Role,
  RoleKindType,
} from '@sputnik-v2/dao/entities';
import { TransactionModel } from './transaction.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class DaoModel extends TransactionModel {
  metadata: Record<string, any>;
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
  link: string;
  description: string;
  createdBy: string;
  status: DaoStatus;
  activeProposalCount: number;
  totalProposalCount: number;
  totalDaoFunds: number;
  policy: DaoPolicyModel;
  config: DaoConfig;
  daoVersion: DaoVersionModel;
  delegations?: DaoDelegationModel[];
}

export class DaoPolicyModel {
  proposalBond: string;
  bountyBond: string;
  proposalPeriod: number;
  bountyForgivenessPeriod: number;
  defaultVotePolicy: VotePolicy;
  roles: DaoRoleModel[];
}

export class DaoRoleModel {
  id: string;
  name: string;
  kind: RoleKindType;
  balance: number;
  accountIds: string[];
  permissions: string[];
  votePolicy: Record<string, VotePolicy>;
}

export class DaoVersionModel {
  hash: string;
  version: number[];
  commitId: string;
  changelogUrl: string;
}

export class DaoDelegationModel {
  id: string;
  accountId: string;
  balance: string;
  delegators: Record<string, any>;
}

export function mapDaoToDaoModel(dao: Dao): DaoModel {
  return {
    entityType: DynamoEntityType.Dao,
    id: dao.id,
    isArchived: dao.isArchived,
    transactionHash: dao.transactionHash,
    updateTransactionHash: dao.updateTransactionHash,
    createTimestamp: dao.createTimestamp,
    updateTimestamp: dao.updateTimestamp,
    metadata: dao.metadata,
    amount: dao.amount,
    totalSupply: dao.totalSupply,
    lastBountyId: dao.lastBountyId,
    lastProposalId: dao.lastProposalId,
    stakingContract: dao.stakingContract,
    numberOfAssociates: dao.numberOfAssociates,
    numberOfMembers: dao.numberOfMembers,
    numberOfGroups: dao.numberOfGroups,
    council: dao.council,
    accountIds: dao.accountIds,
    councilSeats: dao.councilSeats,
    link: dao.link,
    description: dao.description,
    createdBy: dao.createdBy,
    status: dao.status,
    activeProposalCount: dao.activeProposalCount,
    totalProposalCount: dao.totalProposalCount,
    totalDaoFunds: dao.totalDaoFunds,
    policy: dao.policy ? mapPolicyToDaoPolicyModel(dao.policy) : undefined,
    config: dao.config,
    daoVersion: mapDaoVersionToDaoVersionModel(dao.daoVersion),
    delegations: dao.delegations?.map(mapDelegationToDaoDelegationModel),
  };
}

export function mapPolicyToDaoPolicyModel(policy: Policy): DaoPolicyModel {
  return {
    proposalBond: policy.proposalBond,
    bountyBond: policy.bountyBond,
    proposalPeriod: policy.proposalPeriod,
    bountyForgivenessPeriod: policy.bountyForgivenessPeriod,
    defaultVotePolicy: policy.defaultVotePolicy,
    roles: policy.roles.map(mapRoleToDaoRoleModel),
  };
}

export function mapRoleToDaoRoleModel(role: Role): DaoRoleModel {
  return {
    id: role.id,
    name: role.name,
    kind: role.kind,
    balance: role.balance,
    accountIds: role.accountIds,
    permissions: role.permissions,
    votePolicy: role.votePolicy,
  };
}

export function mapDaoVersionToDaoVersionModel(
  version: DaoVersion,
): DaoVersionModel {
  return {
    hash: version.hash,
    version: version.version,
    commitId: version.commitId,
    changelogUrl: version.changelogUrl,
  };
}

export function mapDelegationToDaoDelegationModel(
  delegation: Delegation,
): DaoDelegationModel {
  return {
    id: delegation.id,
    accountId: delegation.accountId,
    balance: delegation.balance,
    delegators: delegation.delegators,
  };
}