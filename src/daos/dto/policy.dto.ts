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
  @ApiProperty()
  @IsString()
  proposal_bond: string;

  @ApiProperty()
  @IsString()
  bounty_bond: string;

  @ApiProperty()
  @IsNumber()
  proposal_period: number;

  @ApiProperty()
  @IsNumber()
  bounty_forgiveness_period: number;

  @ApiProperty()
  @IsObject()
  default_vote_policy: VotePolicy;

  @ApiProperty()
  @IsArray()
  roles: RolePermission[];
}
