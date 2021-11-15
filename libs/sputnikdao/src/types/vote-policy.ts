import { ApiProperty } from '@nestjs/swagger';

export enum WeightKind {
  /// Using token amounts and total delegated at the moment.
  TokenWeight = 'TokenWeight',

  /// Weight of the group role. Roles that don't have scoped group are not supported.
  RoleWeight = 'RoleWeight',
}

export enum WeightOrRatioType {
  Weight = 'Weight',
  Ratio = 'Ratio',
}

export class VotePolicy {
  /// Kind of weight to use for votes.
  @ApiProperty({ enum: Object.keys(WeightKind) })
  weightKind: WeightKind;

  /// Minimum number required for vote to finalize.
  /// If weight kind is TokenWeight - this is minimum number of tokens required.
  ///     This allows to avoid situation where the number of staked tokens from total supply is too small.
  /// If RoleWeight - this is minimum umber of votes.
  ///     This allows to avoid situation where the role is got too small but policy kept at 1/2, for example.
  @ApiProperty()
  quorum: number;

  /// How many votes to pass this vote.
  @ApiProperty({ enum: Object.keys(WeightOrRatioType) })
  kind: WeightOrRatioType;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  ratio: number[];
}

export function castVotePolicy(policy: unknown): VotePolicy | null {
  if (!policy) {
    return null;
  }

  const { threshold, weightKind, quorum } = (policy as any) || {};

  let votePolicy = {
    weightKind,
    quorum,
  };

  if (threshold instanceof Array) {
    return {
      ...votePolicy,
      kind: WeightOrRatioType.Ratio,
      ratio: threshold,
    } as VotePolicy;
  }

  return {
    ...votePolicy,
    kind: WeightOrRatioType.Weight,
    weight: threshold,
  } as VotePolicy;
}
