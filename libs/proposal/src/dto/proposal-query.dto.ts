import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AccountProposalQuery } from '@sputnik-v2/proposal/dto/account-proposal-query.dto';

export class ProposalQuery extends AccountProposalQuery {
  @ApiProperty({
    description: 'Near Account ID to check permissions',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountId?: string;
}
