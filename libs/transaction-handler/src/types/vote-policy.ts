import {
  VotePolicy,
  WeightKind,
  WeightOrRatioType,
} from '@sputnik-v2/dao/types';
import {
  SputnikDaoVotePolicy,
  SputnikDaoVotePolicyWeightKind,
} from '@sputnik-v2/near-api';

export function castVotePolicy(
  policy: SputnikDaoVotePolicy,
): VotePolicy | null {
  if (!policy) {
    return null;
  }

  const { threshold, weight_kind, quorum } = policy;

  switch (weight_kind) {
    case SputnikDaoVotePolicyWeightKind.RoleWeight:
      return {
        weightKind: WeightKind.RoleWeight,
        quorum,
        kind: WeightOrRatioType.Ratio,
        ratio: threshold as number[],
      };

    case SputnikDaoVotePolicyWeightKind.TokenWeight:
      return {
        weightKind: WeightKind.TokenWeight,
        quorum,
        kind: WeightOrRatioType.Weight,
        weight: threshold as string,
      };
  }

  throw new Error(`Invalid vote policy: ${JSON.stringify(policy)}`);
}
