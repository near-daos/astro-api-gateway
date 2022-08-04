import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '@sputnik-v2/common';
import { DraftProposalBasicResponse } from '@sputnik-v2/draft-proposal';

export class DraftPageResponse extends BaseResponseDto<DraftProposalBasicResponse> {
  @ApiProperty({ type: [DraftProposalBasicResponse] })
  data: DraftProposalBasicResponse[];
}
