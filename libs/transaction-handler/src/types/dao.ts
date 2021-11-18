import camelcaseKeys from 'camelcase-keys';
import { RoleKindType } from '@sputnik-v2/dao/entities';
import { SputnikDaoDto } from '@sputnik-v2/dao/dto';
import { buildRoleId, getBlockTimestamp } from '@sputnik-v2/utils';

import { castRolePermission } from './role';
import { castVotePolicy } from './vote-policy';

function castDaoPolicy({ daoId, daoPolicy }) {
  const policy = camelcaseKeys(daoPolicy, { deep: true });
  const roles = daoPolicy.roles.map((role) => ({
    ...castRolePermission(camelcaseKeys(role)),
    id: buildRoleId(daoId, role.name),
    policy: { daoId },
  }));
  const council = roles
    .filter(
      ({ name, kind }) => 'council' === name && RoleKindType.Group === kind,
    )
    .map(({ accountIds }) => accountIds)
    .reduce((acc, val) => acc.concat(val), []);

  return {
    council,
    councilSeats: council?.length,
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
  amount,
  args,
  timestamp = getBlockTimestamp(),
}): SputnikDaoDto {
  return {
    id: daoId,
    config: args.config,
    ...castDaoPolicy({ daoId, daoPolicy: args.policy }),
    amount: Number(amount),
    totalSupply: '0',
    lastBountyId: 0,
    lastProposalId: 0,
    stakingContract: '',
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
  transactionHash,
  timestamp = getBlockTimestamp(),
}): SputnikDaoDto {
  return {
    ...dao,
    lastProposalId: Number(dao.lastProposalId) + 1,
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
    lastBountyId,
    stakingContract,
    amount: amount && Number(amount),
    updateTransactionHash: transactionHash,
    updateTimestamp: timestamp,
  };
}
