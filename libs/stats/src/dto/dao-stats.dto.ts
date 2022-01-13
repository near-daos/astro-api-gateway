import { ApiProperty } from '@nestjs/swagger';

export class DaoStatsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  daoId: string;

  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  totalDaoFunds: number;

  @ApiProperty()
  transactionsCount?: number;

  @ApiProperty()
  bountyCount: number;

  @ApiProperty()
  nftCount: number;

  @ApiProperty()
  activeProposalCount: number;

  @ApiProperty()
  totalProposalCount: number;
}
