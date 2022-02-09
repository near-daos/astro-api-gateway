import { PagingQuery } from './PagingQuery';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchQuery extends PagingQuery {
  @ApiProperty({
    description: 'Text to search',
    required: true,
  })
  query: string;

  @ApiProperty({
    description: 'Near Account ID to check proposal permissions',
    required: false,
  })
  @IsOptional()
  accountId?: string;
}
