import camelcaseKeys from 'camelcase-keys';
import { RoleKindType } from '@sputnik-v2/dao/entities';

import { castVotePolicy, VotePolicy } from './vote-policy';

export type RolePermissionDto = {
  id: string;
  name: string;
  kind: RoleKindType;
  balance: number;
  accountIds: string[];
  permissions: string[];
  votePolicy: { [key: string]: VotePolicy };
};

export function castRolePermission(permission): RolePermissionDto | null {
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
