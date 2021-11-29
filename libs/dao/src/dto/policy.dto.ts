import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { RolePermissionDto, VotePolicy } from '@sputnik-v2/sputnikdao/types';

export class PolicyDto {
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

  @ApiProperty()
  @IsArray()
  roles: RolePermissionDto[];
}
