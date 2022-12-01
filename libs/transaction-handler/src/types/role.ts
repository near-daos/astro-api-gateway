import { RoleKindType } from '@sputnik-v2/dao/entities';
import { RolePermission } from '@sputnik-v2/dao/types';
import {
  isSputnikDaoRoleKindEveryone,
  isSputnikDaoRoleKindGroup,
  isSputnikDaoRoleKindMember,
  SputnikDaoRole,
} from '@sputnik-v2/near-api';
import { castVotePolicy } from './vote-policy';

export function castRolePermission(
  role: SputnikDaoRole,
): RolePermission | null {
  if (!role) {
    return null;
  }

  const votePolicy = Object.fromEntries(
    Object.entries(role.vote_policy).map(([type, policy]) => [
      type,
      castVotePolicy(policy),
    ]),
  );

  if (isSputnikDaoRoleKindEveryone(role.kind)) {
    return {
      name: role.name,
      kind: RoleKindType.Everyone,
      permissions: role.permissions,
      votePolicy,
    };
  }

  if (isSputnikDaoRoleKindMember(role.kind)) {
    return {
      name: role.name,
      kind: RoleKindType.Member,
      balance: role.kind.Member,
      permissions: role.permissions,
      votePolicy,
    };
  }

  if (isSputnikDaoRoleKindGroup(role.kind)) {
    return {
      name: role.name,
      kind: RoleKindType.Group,
      accountIds: role.kind.Group,
      permissions: role.permissions,
      votePolicy,
    };
  }

  throw new Error(`Invalid role: ${JSON.stringify(role)}`);
}
