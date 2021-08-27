import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { SortParam } from './SortParam';

export class PagingQuery {
  @ApiProperty({
    description: 'Query Offset',
    default: 0,
    required: false,
  })
  @IsNumber()
  offset: number = 0;

  @ApiProperty({
    description: 'Query Limit',
    default: 50,
    required: false,
  })
  @IsNumber()
  limit: number = 50;

  @ApiProperty({
    description: `Sorting: comma-separated fields prefixed by '-' sign if DESC order. Example: '&sort=-id,createdAt' - sort by ID DESC and createdAt ASC`,
    required: false
  })
  sort: string;

  order: SortParam;
}
