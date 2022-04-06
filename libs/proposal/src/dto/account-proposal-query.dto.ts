import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ProposalQuery } from './proposal-query.dto';

export class AccountProposalQuery extends ProposalQuery {
  @ApiProperty({
    description: 'Near Account ID to check permissions',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountId?: string;
}
