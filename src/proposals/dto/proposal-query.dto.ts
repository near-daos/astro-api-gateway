import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PagingQuery } from 'src/common';

export class ProposalQuery extends PagingQuery {
  @ApiProperty({
    description: 'Dao ID',
    default: null,
    required: false,
  })
  @IsString()
  @IsOptional()
  daoId? = null;
}
