import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PagingQuery } from 'src/common';

export class ProposalQuery extends PagingQuery {
  @ApiProperty({
    description: 'Dao ID',
    default: undefined,
    required: false,
  })
  @IsString()
  @IsOptional()
  daoId?: string;
}
