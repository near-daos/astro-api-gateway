import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { DaoFeed } from './dao-feed.dto';

export class DaoFeedResponse extends BaseResponse<DaoFeed> {
  @ApiProperty({ type: [DaoFeed] })
  data: DaoFeed[];
}
