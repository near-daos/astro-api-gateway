import { BaseResponseDto } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';

import { Proposal } from '../entities';

export class ProposalsResponse extends BaseResponseDto<Proposal> {
  @ApiProperty({ type: () => [Proposal] })
  data: Proposal[];
}
