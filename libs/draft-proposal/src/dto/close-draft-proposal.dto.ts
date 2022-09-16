import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CloseDraftProposal {
  @ApiProperty()
  @IsNotEmpty()
  proposalId: string;
}
