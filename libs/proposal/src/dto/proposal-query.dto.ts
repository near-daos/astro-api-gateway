import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { EntityQuery } from '@sputnik-v2/common';
import { Transform } from 'class-transformer';

export class ProposalQuery extends EntityQuery {
  @ApiProperty({
    description: 'Near Account ID to check permissions',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiProperty({
    description: 'Near Account ID to check permissions',
    required: false,
    type: Boolean,
  })
  @Transform(({ value }) => (value ? value === 'true' : value))
  @IsOptional()
  voted?: string;
}
