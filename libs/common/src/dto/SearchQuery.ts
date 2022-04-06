import { PagingQuery } from './PagingQuery';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchQuery extends PagingQuery {
  @ApiProperty({
    description: 'Text to search',
    required: true,
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Near Account ID to check proposal permissions',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountId?: string;
}
