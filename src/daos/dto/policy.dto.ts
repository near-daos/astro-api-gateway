import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsString
} from 'class-validator';
import { RolePermission } from 'src/sputnikdao/types/role';
import { VotePolicy } from 'src/sputnikdao/types/vote-policy';

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
  roles: RolePermission[];
}
