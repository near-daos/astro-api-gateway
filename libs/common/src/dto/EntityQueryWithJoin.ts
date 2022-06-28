import { ApiProperty } from '@nestjs/swagger';
import { QueryJoin } from '@nestjsx/crud-request';
import { IsOptional } from 'class-validator';

import { EntityQuery } from './EntityQuery';

export class EntityQueryWithJoin extends EntityQuery {
  @ApiProperty({
    description:
      'Receive joined relational objects in GET result (with all or selected fields). Syntax: ```join=relation1||field11,field12,...&join=relation1.nested||field21,field22,...&join=...```',
    required: false,
  })
  @IsOptional()
  join?: QueryJoin[];
}
