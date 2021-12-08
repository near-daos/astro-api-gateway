import { ApiProperty } from '@nestjsx/crud/lib/crud';

import { Dao } from '../entities/dao.entity';

export class DaoFeed extends Dao {
  @ApiProperty()
  totalProposalCount: number;

  @ApiProperty()
  activeProposalCount: number;

  @ApiProperty()
  totalDaoFunds: string;
}
