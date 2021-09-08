import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/dto/BaseResponse';
import { Dao } from '../entities/dao.entity';

export class DaoResponse extends BaseResponse<Dao> {
  @ApiProperty({ type: [Dao] })
  data: Dao[];
}
