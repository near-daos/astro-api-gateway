import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import {
  ParsedRequestParams,
  QueryFields,
  QueryFilter,
  QueryJoin,
  QuerySort,
  SCondition,
} from '@nestjsx/crud-request';
import { ObjectLiteral } from 'typeorm';

export class QueryParams implements ParsedRequestParams {
  @ApiProperty({
    required: false,
  })
  fields: QueryFields;

  @ApiHideProperty()
  paramsFilter: QueryFilter[];

  @ApiHideProperty()
  authPersist: ObjectLiteral;

  @ApiProperty({
    required: false,
  })
  search: SCondition;

  @ApiProperty({
    required: false,
  })
  filter: QueryFilter[];

  @ApiProperty({
    required: false,
  })
  or: QueryFilter[];

  @ApiProperty({
    required: false,
  })
  join: QueryJoin[];

  @ApiProperty({
    description: `Sorting. Syntax: ?sort=field,ASC|DESC`,
    required: false,
  })
  sort: QuerySort[];

  @ApiProperty({
    description: 'Query Limit',
    default: 50,
    required: false,
  })
  limit: number = 50;

  @ApiProperty({
    description: 'Query Offset',
    default: 0,
    required: false,
  })
  offset: number = 0;

  @ApiProperty({
    required: false,
  })
  page: number;

  @ApiHideProperty()
  cache: number;

  @ApiHideProperty()
  includeDeleted: number;
}
