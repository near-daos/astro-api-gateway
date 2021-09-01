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

//TODO: check type casting
export type WeightOrRatio =
  | {
      type: WeightOrRatioType.Weight;
      value: number;
    }
  | {
      type: WeightOrRatioType.Ratio;
      value: number[];
    };

export type VotePolicy = {
  /// Kind of weight to use for votes.
  weightKind: WeightKind;

  /// Minimum number required for vote to finalize.
  /// If weight kind is TokenWeight - this is minimum number of tokens required.
  ///     This allows to avoid situation where the number of staked tokens from total supply is too small.
  /// If RoleWeight - this is minimum umber of votes.
  ///     This allows to avoid situation where the role is got too small but policy kept at 1/2, for example.
  quorum: number;

  /// How many votes to pass this vote.
  threshold: WeightOrRatio;
};
