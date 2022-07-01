import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Span } from 'nestjs-ddtrace';

import {
  DaoStatsEntryFields,
  DaoStatsService,
  DaoStatsStateDto,
  ProposalStatsEntryDto,
  StatsEntryDto,
} from '@sputnik-v2/stats';

import { FindOneParams } from '@sputnik-v2/common';

@Span()
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
  @ApiNotFoundResponse({
    description: 'DAO <id> not found',
  })
  @Get('/dao/:id/state')
  async getDaoStatsState(
    @Param() { id }: FindOneParams,
  ): Promise<DaoStatsStateDto> {
    const oneDayAgo = new Date();
    oneDayAgo.setUTCHours(0, 0, 0, 0);
    const daoStats = await this.daoStatsService.getDaoStats(id);
    const previousDaoStats = await this.daoStatsService.getLastDaoStats(
      id,
      oneDayAgo.getTime(),
    );
    return this.daoStatsService.getDaoStatsState(daoStats, previousDaoStats);
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
  @ApiNotFoundResponse({
    description: 'DAO <id> not found',
  })
  @Get('/dao/:id/funds')
  async getDaoStatsFunds(
    @Param() { id }: FindOneParams,
  ): Promise<StatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsEntries(
      id,
      DaoStatsEntryFields.Funds,
    );
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
  @ApiNotFoundResponse({
    description: 'DAO <id> not found',
  })
  @Get('/dao/:id/bounties')
  async getDaoStatsBounties(
    @Param() { id }: FindOneParams,
  ): Promise<StatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsEntries(
      id,
      DaoStatsEntryFields.BountyCount,
    );
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
  @ApiNotFoundResponse({
    description: 'DAO <id> not found',
  })
  @Get('/dao/:id/nfts')
  async getDaoStatsNfts(
    @Param() { id }: FindOneParams,
  ): Promise<StatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsEntries(
      id,
      DaoStatsEntryFields.NftCount,
    );
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
  @ApiNotFoundResponse({
    description: 'DAO <id> not found',
  })
  @Get('/dao/:id/proposals')
  async getDaoStatsProposals(
    @Param() { id }: FindOneParams,
  ): Promise<ProposalStatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsProposalEntries(id);
  }
}
