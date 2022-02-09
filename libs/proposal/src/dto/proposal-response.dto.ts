import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { Proposal } from '../entities/proposal.entity';

export class ProposalResponse extends BaseResponse<Proposal> {
  @ApiProperty({ type: () => [Proposal] })
  data: Proposal[];
}
