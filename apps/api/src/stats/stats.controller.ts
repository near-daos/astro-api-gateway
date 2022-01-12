import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DaoStatsService,
  DaoStatsStateDto,
  ProposalStatsEntryDto,
  StatsEntryDto,
} from '@sputnik-v2/stats';

import { FindOneParams } from '@sputnik-v2/common';

@ApiTags('Stats')
@Controller('/stats')
export class StatsController {
  constructor(private readonly daoStatsService: DaoStatsService) {}

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'DAO Stats State',
    type: DaoStatsStateDto,
  })
  @Get('/dao/:id/state')
  async getDaoStatsState(
    @Param() { id }: FindOneParams,
  ): Promise<DaoStatsStateDto> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.daoStatsService.getDaoStatsState(id, oneDayAgo.getTime());
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of DAO funds stats',
    type: StatsEntryDto,
    isArray: true,
  })
  @Get('/dao/:id/funds')
  async getDaoStatsFunds(
    @Param() { id }: FindOneParams,
  ): Promise<StatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsEntries(id, 'totalDaoFunds');
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of DAO bounties count stats',
    type: StatsEntryDto,
    isArray: true,
  })
  @Get('/dao/:id/bounties')
  async getDaoStatsBounties(
    @Param() { id }: FindOneParams,
  ): Promise<StatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsEntries(id, 'bountyCount');
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of DAO NFTs count stats',
    type: StatsEntryDto,
    isArray: true,
  })
  @Get('/dao/:id/nfts')
  async getDaoStatsNfts(
    @Param() { id }: FindOneParams,
  ): Promise<StatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsEntries(id, 'nftCount');
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of DAO proposals count stats',
    type: ProposalStatsEntryDto,
    isArray: true,
  })
  @Get('/dao/:id/proposals')
  async getDaoStatsProposals(
    @Param() { id }: FindOneParams,
  ): Promise<ProposalStatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsProposalEntries(id);
  }
}
