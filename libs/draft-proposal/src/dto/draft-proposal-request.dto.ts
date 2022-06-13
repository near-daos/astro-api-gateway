import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DraftProposalRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accountId: string;
}
