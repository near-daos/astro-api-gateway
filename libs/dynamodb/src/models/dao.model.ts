import { DaoConfig, DaoStatus, VotePolicy } from '@sputnik-v2/dao/types';
import {
  Dao,
  DaoVersion,
  Delegation,
  Policy,
  Role,
  RoleKindType,
} from '@sputnik-v2/dao/entities';
import { DaoSettings, DaoSettingsDto } from '@sputnik-v2/dao-settings';
import { buildEntityId } from '@sputnik-v2/utils';
import { TransactionModel } from './transaction.model';
import { DynamoEntityType, PartialEntity } from '../types';
import { TokenBalanceModel } from '@sputnik-v2/dynamodb/models/token-balance.model';

export class DaoModel extends TransactionModel {
  metadata: Record<string, any>;
  amount: number;
  id: string;
  totalSupply: string;
  lastBountyId: number;
  lastProposalId: number;
  stakingContract: string;
  numberOfAssociates: number;
  numberOfMembers: number;
  numberOfGroups: number;
  council: string[];
  accountIds: string[];
  followers: string[];
  tokens: TokenBalanceModel[];
  councilSeats: number;
  link: string;
  description: string;
  createdBy: string;
  status: DaoStatus;
  activeProposalCount: number;
  totalProposalCount: number;
  totalDaoFunds: number;
  policy?: DaoPolicyModel;
  config?: DaoConfig;
  daoVersion?: DaoVersionModel;
  delegations?: DaoDelegationModel[];
  settings?: DaoSettingsDto;
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
    partitionId: dao.id,
    entityId: buildEntityId(DynamoEntityType.Dao, dao.id),
    entityType: DynamoEntityType.Dao,
    isArchived: dao.isArchived,
    processingTimeStamp: Date.now(),
    id: dao.id,
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
    followers: [],
    tokens: [],
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
    daoVersion: dao.daoVersion
      ? mapDaoVersionToDaoVersionModel(dao.daoVersion)
      : undefined,
    delegations: dao.delegations?.map(mapDelegationToDaoDelegationModel),
  };
}

export function mapDaoModelToDao(dao: DaoModel): Dao {
  const daoEntity = {
    id: dao.partitionId,
    config: dao.config,
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
    policy: dao.policy
      ? mapDaoPolicyModelToDaoPolicy(dao.partitionId, dao.policy)
      : undefined,
    link: dao.link,
    description: dao.description,
    createdBy: dao.createdBy,
    daoVersionHash: dao.daoVersion ? dao.daoVersion.hash : undefined,
    daoVersion: dao.daoVersion
      ? mapDaoVersionModelToDaoVersion(dao.daoVersion)
      : undefined,
    status: dao.status,
    activeProposalCount: dao.activeProposalCount,
    totalProposalCount: dao.totalProposalCount,
    totalDaoFunds: dao.totalDaoFunds,
    delegations: undefined,
    transactionHash: dao.transactionHash,
    updateTransactionHash: dao.updateTransactionHash,
    createTimestamp: dao.createTimestamp,
    updateTimestamp: dao.updateTimestamp,
    isArchived: dao.isArchived,
    // TODO
    createdAt: undefined,
    updatedAt: undefined,
  };

  daoEntity.delegations = dao.delegations
    ? dao.delegations.map((delegation) =>
        mapDaoDelegationModelToDelegation(daoEntity, delegation),
      )
    : undefined;

  return daoEntity;
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

export function mapDaoPolicyModelToDaoPolicy(
  daoId: string,
  policy: DaoPolicyModel,
): Policy {
  const policyEntity = {
    daoId,
    proposalBond: policy.proposalBond,
    bountyBond: policy.bountyBond,
    proposalPeriod: policy.proposalPeriod,
    bountyForgivenessPeriod: policy.bountyForgivenessPeriod,
    defaultVotePolicy: policy.defaultVotePolicy,
    roles: undefined,
    // TODO
    isArchived: false,
    createdAt: undefined,
    updatedAt: undefined,
  };

  policyEntity.roles = policy.roles.map((role) =>
    mapDaoRoleModelToRole(policyEntity, role),
  );

  return policyEntity;
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

export function mapDaoRoleModelToRole(
  policy: Policy,
  role: DaoRoleModel,
): Role {
  return {
    id: role.id,
    policy,
    name: role.name,
    kind: role.kind,
    balance: role.balance,
    accountIds: role.accountIds,
    permissions: role.permissions,
    votePolicy: role.votePolicy,
    // TODO
    isArchived: false,
    createdAt: undefined,
    updatedAt: undefined,
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

export function mapDaoVersionModelToDaoVersion(
  version: DaoVersionModel,
): DaoVersion {
  return {
    hash: version.hash,
    version: version.version,
    commitId: version.commitId,
    changelogUrl: version.changelogUrl,
    // TODO
    isArchived: false,
    createdAt: undefined,
    updatedAt: undefined,
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

export function mapDaoDelegationModelToDelegation(
  dao: Dao,
  delegation: DaoDelegationModel,
): Delegation {
  return {
    id: delegation.id,
    daoId: dao.id,
    dao,
    accountId: delegation.accountId,
    balance: delegation.balance,
    delegators: delegation.delegators,
  };
}

export function mapDaoSettingsToDaoModel(
  settings: DaoSettings,
): PartialEntity<DaoModel> {
  return {
    partitionId: settings.daoId,
    entityId: buildEntityId(DynamoEntityType.Dao, settings.daoId),
    entityType: DynamoEntityType.Dao,
    settings: settings.settings,
  };
}
