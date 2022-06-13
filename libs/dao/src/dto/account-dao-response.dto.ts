import { ApiProperty } from '@nestjs/swagger';

import { Dao } from '../entities/dao.entity';

export class AccountDaoResponse extends Dao {
  @ApiProperty({ type: Boolean })
  isCouncil: boolean;
}
