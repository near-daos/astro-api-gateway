import camelcaseKeys from 'camelcase-keys';
import { RoleKindType } from '@sputnik-v2/dao/entities';
import { RolePermission } from '@sputnik-v2/dao/types';

import { castVotePolicy } from './vote-policy';

export function castRolePermission(permission): RolePermission | null {
  if (!permission) {
    return null;
  }

  if (RoleKindType.Everyone === permission.kind) {
    return { ...permission };
  }

  const type = Object.keys(RoleKindType).find((key) =>
    permission?.kind.hasOwnProperty(key),
  );

  const votePolicy = { ...permission.votePolicy };
  Object.keys(votePolicy).map((key) => {
    votePolicy[key] = castVotePolicy(camelcaseKeys(votePolicy[key]));
  });

  const role = {
    ...permission,
    votePolicy,
  };

  switch (type) {
    case RoleKindType.Group:
      return {
        ...role,
        kind: RoleKindType.Group,
        accountIds: permission?.kind[type],
      };
    case RoleKindType.Member:
      return {
        ...role,
        kind: RoleKindType.Member,
        balance: permission?.kind[type],
      };
  }
}
