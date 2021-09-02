import { VotePolicy } from './vote-policy';

export enum RoleKindType {
  Everyone = 'Everyone',
  /// Member greater or equal than given balance. Can use `1` as non-zero balance.
  Member = 'Member',
  /// Set of accounts.
  Group = 'Group',
}

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

export type RolePermission = {
  /// Name of the role to display to the user.
  name: string;
  /// Kind of the role: defines which users this permissions apply.
  kind: RoleKind;
  /// Set of actions on which proposals that this role is allowed to execute.
  /// <proposal_kind>:<action>
  permissions: string[];
  /// For each proposal kind, defines voting policy.
  votePolicy: { [key: string]: VotePolicy };
};

export function castRoleKind(kind: unknown): RoleKind | null {
  if (!kind) {
    return null;
  }

  if (RoleKindType.Everyone === kind) {
    return { type: RoleKindType.Everyone };
  }

  const type = Object.keys(RoleKindType).find((key) =>
    kind.hasOwnProperty(key),
  );

  switch (type) {
    case RoleKindType.Group:
      return {
        type,
        accountIds: kind[type],
      } as RoleKind;
    case RoleKindType.Member:
      return {
        type,
        balance: kind[type],
      } as RoleKind;
  }

  return kind as RoleKind;
}
