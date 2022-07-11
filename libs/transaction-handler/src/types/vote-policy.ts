import camelcaseKeys from 'camelcase-keys';
import { VotePolicy, WeightOrRatioType } from '@sputnik-v2/dao/types';

export function castVotePolicy(policy): VotePolicy | null {
  if (!policy) {
    return null;
  }

  const { threshold, weightKind, quorum } = camelcaseKeys(policy || {});

  if (threshold instanceof Array) {
    return {
      weightKind,
      quorum,
      kind: WeightOrRatioType.Ratio,
      ratio: threshold,
    };
  }

  return {
    weightKind,
    quorum,
    kind: WeightOrRatioType.Weight,
    weight: threshold,
  };
}
