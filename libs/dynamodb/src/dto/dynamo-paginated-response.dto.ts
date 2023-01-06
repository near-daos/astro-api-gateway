import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { DynamoPaginatedResponse } from '@sputnik-v2/dynamodb';

export class DynamoPaginatedResponseMetaDto {
  @ApiProperty()
  nextToken: string | null;
}

export function DynamoPaginatedResponseDto<T>(
  classRef: Type<T>,
): Type<DynamoPaginatedResponse<T>> {
  class DynamoPaginatedResponseDto<T> implements DynamoPaginatedResponse<T> {
    @ApiProperty({
      type: [classRef],
    })
    data: T[];

    @ApiProperty()
    meta: DynamoPaginatedResponseMetaDto;
  }

  return DynamoPaginatedResponseDto;
}
