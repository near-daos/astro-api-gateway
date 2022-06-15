import { ApiProperty } from '@nestjs/swagger';
import { ProposalKindSwaggerDto, ProposalType } from '@sputnik-v2/proposal';

export class UpdateDraftProposal {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    enum: ProposalType,
    enumName: 'ProposalType',
  })
  type: ProposalType;

  @ApiProperty({ type: ProposalKindSwaggerDto })
  kind: ProposalKindSwaggerDto;

  @ApiProperty({ type: [String] })
  hashtags: string[];
}
