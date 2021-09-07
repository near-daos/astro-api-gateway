import { ApiProperty } from '@nestjs/swagger';

import { QueryFilter, QueryJoin, QuerySort } from '@nestjsx/crud-request';

export class QueryParams {
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

  @ApiProperty({
    description:
      'Adds sort by field (by multiple fields) and order to query result. Syntax: ```name,ASC&sort=id,DESC```',
    required: false,
  })
  sort: QuerySort[];

  @ApiProperty({
    description: 'Receive N amount of entities.',
    default: 50,
    required: false,
  })
  limit: number = 50;

  @ApiProperty({
    description: 'Limit the amount of received resources.',
    default: 0,
    required: false,
  })
  offset: number = 0;

  @ApiProperty({
    description: 'Receive a portion of limited amount of resources.',
    required: false,
  })
  page: number;
}
