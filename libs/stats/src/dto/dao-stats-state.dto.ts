import { ApiProperty } from '@nestjs/swagger';

import { StatsStateDto } from './stats-state.dto';

export class DaoStatsStateDto {
  @ApiProperty()
  daoId: string;

  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  amount: StatsStateDto;

  @ApiProperty()
  totalDaoFunds: StatsStateDto;

  @ApiProperty()
  transactionsCount?: StatsStateDto;

  @ApiProperty()
  bountyCount: StatsStateDto;

  @ApiProperty()
  nftCount: StatsStateDto;

  @ApiProperty()
  activeProposalCount: StatsStateDto;

  @ApiProperty()
  totalProposalCount: StatsStateDto;
}
