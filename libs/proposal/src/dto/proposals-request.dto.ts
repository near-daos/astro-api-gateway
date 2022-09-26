import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { SearchDto } from '@sputnik-v2/common';
import { stringToBoolean } from '@sputnik-v2/utils';

export class ProposalsRequest extends SearchDto {
  @ApiProperty({
    description: 'Search by proposal description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({
    description: 'Filter proposals by one of DAO IDs separated by comma',
    required: false,
  })
  @IsString()
  @IsOptional()
  dao?: string;

  @ApiProperty({
    description: 'Filter proposals by one of statuses separated by comma',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Filter proposals by one of types separated by comma',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Filter proposals by one of proposers separated by comma',
    required: false,
  })
  @IsString()
  @IsOptional()
  proposer?: string;

  @ApiProperty({
    description: 'Return proposals that are in progress and not expired',
    required: false,
  })
  @Transform(({ value }) => stringToBoolean(value))
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Return proposals that are failed, moved, removed or expired',
    required: false,
  })
  @Transform(({ value }) => stringToBoolean(value))
  @IsOptional()
  failed?: boolean;

  @ApiProperty({
    description: 'Near Account ID to check permissions',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiProperty({
    description: 'If true returns proposals voted by accountId',
    required: false,
    type: Boolean,
  })
  @Transform(({ value }) => stringToBoolean(value))
  @IsOptional()
  voted?: boolean;
}
