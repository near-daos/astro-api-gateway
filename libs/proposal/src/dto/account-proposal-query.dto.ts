import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { EntityQuery } from '@sputnik-v2/common';
import { Transform } from 'class-transformer';

export class AccountProposalQuery extends EntityQuery {
  @ApiProperty({
    description: 'Near Account ID to check permissions',
    required: false,
    type: Boolean,
  })
  @Transform(({ value }) => (value ? value === 'true' : value))
  @IsOptional()
  voted?: boolean;
}
