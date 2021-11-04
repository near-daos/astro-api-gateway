import { ApiProperty } from '@nestjs/swagger';
import camelcaseKeys from 'camelcase-keys';

export enum WeightKind {
  TokenWeight = 'TokenWeight',
  RoleWeight = 'RoleWeight',
}

export enum WeightOrRatioType {
  Weight = 'Weight',
  Ratio = 'Ratio',
}

export class VotePolicy {
  @ApiProperty({ enum: Object.keys(WeightKind) })
  weightKind: WeightKind;

  @ApiProperty()
  quorum: number;

  @ApiProperty({ enum: Object.keys(WeightOrRatioType) })
  kind: WeightOrRatioType;

  @ApiProperty()
  weight?: number;

  @ApiProperty()
  ratio?: number[];
}

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
