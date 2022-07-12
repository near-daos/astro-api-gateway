import { ApiProperty } from '@nestjs/swagger';

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
