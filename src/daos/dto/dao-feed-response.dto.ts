import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/dto/BaseResponse';
import { DaoFeed } from './dao-feed.dto';

export class DaoFeedResponse extends BaseResponse<DaoFeed> {
  @ApiProperty({ type: [DaoFeed] })
  data: DaoFeed[];
}
