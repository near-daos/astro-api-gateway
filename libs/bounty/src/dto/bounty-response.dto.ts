import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { Bounty } from '../entities/bounty.entity';

export class BountyResponse extends BaseResponse<Bounty> {
  @ApiProperty({ type: [Bounty] })
  data: Bounty[];
}
