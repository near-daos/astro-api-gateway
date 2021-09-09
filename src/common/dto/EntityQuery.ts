import { ApiProperty } from '@nestjs/swagger';

import { QueryFilter, QueryJoin } from '@nestjsx/crud-request';
import { PagingQuery } from './PagingQuery';

export class EntityQuery extends PagingQuery {
  @ApiProperty({
    description:
      'Selects fields that should be returned in the reponse body. Syntax: ```field1,field2,...```',
    required: false,
  })
  fields: string;

  @ApiProperty({
    description:
      'Adds a search condition as a JSON string to you request. Syntax: ```{"$or": [{"isActive": false}, {"updatedAt": {"$notnull": true}}]}```',
    required: false,
  })
  s: string;

  @ApiProperty({
    description:
      'Adds fields request condition (multiple conditions) to your request. Syntax: ```field||$condition||value```',
    required: false,
  })
  filter: QueryFilter[];

  @ApiProperty({
    description:
      'Adds ```OR``` conditions to the request. Syntax: ```field||$condition||value```',
    required: false,
  })
  or: QueryFilter[];

  @ApiProperty({
    description:
      'Receive joined relational objects in GET result (with all or selected fields). Syntax: ```relation1||field11,field12,...```',
    required: false,
  })
  join: QueryJoin[];
}
