import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { BountyContext } from '../entities/bounty-context.entity';

export class BountyContextResponse extends BaseResponse<BountyContext> {
  @ApiProperty({ type: [BountyContext] })
  data: BountyContext[];
}
