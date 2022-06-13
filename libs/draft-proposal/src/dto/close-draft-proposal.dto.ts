import { ApiProperty } from '@nestjs/swagger';

export class CloseDraftProposal {
  @ApiProperty()
  proposalId: string;
}
