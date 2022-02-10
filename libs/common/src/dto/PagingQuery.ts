import { ApiProperty } from '@nestjs/swagger';
import { QuerySort } from '@nestjsx/crud-request';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PagingQuery {
  @ApiProperty({
    description:
      'Adds sort by field (by multiple fields) and order to query result. Syntax: ```name,ASC&sort=id,DESC```',
    required: false,
    default: 'createdAt,DESC',
  })
  @IsOptional()
  @IsArray()
  sort?: QuerySort[];

  @ApiProperty({
    description: 'Receive N amount of entities.',
    default: 50,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 50;

  @ApiProperty({
    description: 'Limit the amount of received resources.',
    default: 0,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset?: number = 0;

  @ApiProperty({
    description: 'Receive a portion of limited amount of resources.',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;
}
