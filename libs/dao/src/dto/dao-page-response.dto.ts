import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { DaoResponseV1 } from './dao-response.dto';

export class DaoPageResponse extends BaseResponse<DaoResponseV1> {
  @ApiProperty({ type: [DaoResponseV1] })
  data: DaoResponseV1[];
}
