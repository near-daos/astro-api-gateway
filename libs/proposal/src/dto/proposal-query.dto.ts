import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { EntityQuery } from '@sputnik-v2/common';
import { Transform } from 'class-transformer';

export class ProposalQuery extends EntityQuery {
  @ApiProperty({
    description: 'If true returns proposals voted by accountId',
    required: false,
    type: Boolean,
  })
  @Transform(({ value }) => (value ? value === 'true' : value))
  @IsOptional()
  voted?: boolean;
}
