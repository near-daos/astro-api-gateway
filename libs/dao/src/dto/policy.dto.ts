import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { VotePolicy } from '../types';
import { castRoleDtoV2, RoleDtoV1, RoleDtoV2 } from './role.dto';

class PolicyBaseDto {
  daoId: string;

  @ApiProperty()
  @IsString()
  proposalBond: string;

  @ApiProperty()
  @IsString()
  bountyBond: string;

  @ApiProperty()
  @IsNumber()
  proposalPeriod: number;

  @ApiProperty()
  @IsNumber()
  bountyForgivenessPeriod: number;

  @ApiProperty()
  @IsObject()
  defaultVotePolicy: VotePolicy;
}

export class PolicyDtoV1 extends PolicyBaseDto {
  @ApiProperty({ type: RoleDtoV1 })
  @IsArray()
  roles: RoleDtoV1[];
}

export class PolicyDtoV2 extends PolicyBaseDto {
  @ApiProperty({ type: RoleDtoV2 })
  @IsArray()
  roles: RoleDtoV2[];
}

export function castPolicyDtoV2(policy: PolicyDtoV1): PolicyDtoV2 {
  return {
    ...policy,
    roles: policy.roles.map((role) => castRoleDtoV2(role)),
  };
}
