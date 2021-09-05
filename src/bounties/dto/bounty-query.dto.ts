import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PagingQuery } from 'src/common';
import { BountySortParam } from './bounty-sort.dto';

export class BountyQuery extends PagingQuery {
  @ApiProperty({
    description: 'Dao ID',
    default: undefined,
    required: false,
  })
  @IsString()
  @IsOptional()
  daoId?: string;

  order: BountySortParam;
}
