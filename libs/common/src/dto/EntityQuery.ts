import { ApiProperty } from '@nestjs/swagger';
import { QueryFilter } from '@nestjsx/crud-request';
import { IsOptional, IsString } from 'class-validator';

import { PagingQuery } from './PagingQuery';

export class EntityQuery extends PagingQuery {
  @ApiProperty({
    description:
      'Selects fields that should be returned in the reponse body. Syntax: ```field1,field2,...```',
    required: false,
  })
  @IsString()
  @IsOptional()
  fields?: string;

  @ApiProperty({
    description:
      'Adds a search condition as a JSON string to you request. Syntax: ```{"$or": [{"isActive": false}, {"updatedAt": {"$notnull": true}}]}```',
    required: false,
  })
  @IsString()
  @IsOptional()
  s?: string;

  @ApiProperty({
    description:
      'Adds fields request condition (multiple conditions) to your request. Syntax: ```field||$condition||value```',
    required: false,
  })
  filter?: QueryFilter[];

  @ApiProperty({
    description:
      'Adds ```OR``` conditions to the request. Syntax: ```field||$condition||value```',
    required: false,
  })
  or?: QueryFilter[];
}
