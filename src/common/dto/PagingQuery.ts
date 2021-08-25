import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

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
}
