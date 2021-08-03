import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PagingQuery } from './PagingQuery';

export class SearchQuery extends PagingQuery {

  @ApiProperty({
    description: 'Search Query',
    required: true
  })
  @IsNotEmpty()
  query: string;
}
