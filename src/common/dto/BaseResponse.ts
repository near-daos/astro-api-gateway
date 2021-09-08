import { ApiProperty } from '@nestjs/swagger';

import { GetManyDefaultResponse } from '@nestjsx/crud';

export class BaseResponse<T> implements GetManyDefaultResponse<T> {
  data: T[];

  @ApiProperty()
  count: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageCount: number;
}
