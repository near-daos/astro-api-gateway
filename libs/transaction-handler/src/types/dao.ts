import camelcaseKeys from 'camelcase-keys';
import { RoleKindType } from '@sputnik-v2/dao/entities';
import { SputnikDaoDto } from '@sputnik-v2/dao/dto';
import { btoaJSON, buildRoleId, getBlockTimestamp } from '@sputnik-v2/utils';

import { castRolePermission } from './role';
import { castVotePolicy } from './vote-policy';
import { DaoStatus } from '@sputnik-v2/dao';

export function castDaoPolicy({ daoId, daoPolicy }) {
  const policy = camelcaseKeys(daoPolicy, { deep: true });
  const roles = daoPolicy.roles.map((role) => ({
    ...castRolePermission(camelcaseKeys(role)),
    id: buildRoleId(daoId, role.name),
    policy: { daoId },
  }));
  const council = roles
    .filter(
      ({ name, kind }) =>
        'council' === name.toLowerCase() && RoleKindType.Group === kind,
    )
    .map(({ accountIds }) => accountIds)
    .reduce((acc, val) => acc.concat(val), []);
  const accountIds = [
    ...new Set(roles.map((role) => role.accountIds).flat()),
  ].filter((accountId) => accountId);
  const groups = roles.filter((role) => role.kind === RoleKindType.Group);
  const numberOfMembers = [
    ...new Set(groups.map((group) => group.accountIds).flat()),
  ].length;
  const numberOfGroups = groups.length;

  return {
    council,
    councilSeats: council?.length,
    numberOfMembers,
    numberOfGroups,
    accountIds,
    policy: {
      ...policy,
      daoId,
      roles,
      defaultVotePolicy: castVotePolicy(policy.defaultVotePolicy),
    },
  };
}

export function castCreateDao({
  signerId,
  transactionHash,
  daoId,
  daoInfo,
  timestamp = getBlockTimestamp(),
}): SputnikDaoDto {
  return {
    id: daoId,
    config: daoInfo.config,
    ...castDaoPolicy({ daoId, daoPolicy: daoInfo.policy }),
    metadata: btoaJSON(daoInfo.config.metadata),
    amount: Number(daoInfo.amount),
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

export function castAddProposalDao({
  dao,
  lastProposalId,
  transactionHash,
  timestamp = getBlockTimestamp(),
}): SputnikDaoDto {
  return {
    ...dao,
    lastProposalId: Number(lastProposalId),
    updateTransactionHash: transactionHash,
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
  timestamp = getBlockTimestamp(),
}: any): SputnikDaoDto {
  const daoPolicy = policy
    ? castDaoPolicy({ daoId: dao.id, daoPolicy: policy })
    : {};
  return {
    ...dao,
    ...daoPolicy,
    config,
    metadata: btoaJSON(config.metadata),
    lastBountyId,
    stakingContract,
    amount: amount && Number(amount),
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}
