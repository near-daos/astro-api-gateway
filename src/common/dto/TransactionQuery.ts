import { ApiProperty } from '@nestjs/swagger';

import { QuerySort } from '@nestjsx/crud-request';
import { EntityQuery } from './EntityQuery';

export class TransactionQuery extends EntityQuery {
  @ApiProperty({
    default: 'blockTimestamp,DESC',
  })
  sort: QuerySort[];
}
