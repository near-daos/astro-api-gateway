import camelcaseKeys from 'camelcase-keys';
import { RoleKindType } from '@sputnik-v2/dao/entities';

import { castVotePolicy, VotePolicy } from './vote-policy';

export type RoleKind =
  /// Matches everyone, who is not matched by other roles.
  | {
      type: RoleKindType.Everyone;
    }
  /// Member greater or equal than given balance. Can use `1` as non-zero balance.
  | {
      type: RoleKindType.Member;
      balance: number;
    }
  /// Set of accounts.
  | {
      type: RoleKindType.Group;
      accountIds: string[];
    };

export type RolePermissionDto = {
  id: string;
  /// Name of the role to display to the user.
  name: string;
  /// Kind of the role: defines which users this permissions apply.
  kind: RoleKindType;
  balance: number;
  accountIds: string[];
  /// Set of actions on which proposals that this role is allowed to execute.
  /// <proposal_kind>:<action>
  permissions: string[];
  /// For each proposal kind, defines voting policy.
  votePolicy: { [key: string]: VotePolicy };
};

export function castRolePermission(permission: any): RolePermissionDto | null {
  if (!permission) {
    return null;
  }

  if (RoleKindType.Everyone === (permission as any).kind) {
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
