import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { Dao } from '../entities/dao.entity';

export class DaoResponse extends BaseResponse<Dao> {
  @ApiProperty({ type: [Dao] })
  data: Dao[];
}
