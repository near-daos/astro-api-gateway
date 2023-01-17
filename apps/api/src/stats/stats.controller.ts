import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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

  @ApiOperation({
    summary: 'Get DAO Stats State',
  })
  @ApiOkResponse({
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
    const daoStats = await this.daoStatsService.getDaoStats(id);
    const previousDaoStats = await this.daoStatsService.getLastDaoStats(id);
    return this.daoStatsService.getDaoStatsState(daoStats, previousDaoStats);
  }

  @ApiOperation({
    summary: 'Get DAO balance stats',
  })
  @ApiOkResponse({
    description: 'List of DAO balance stats',
    type: [StatsEntryDto],
  })
  @ApiNotFoundResponse({
    description: 'DAO <id> not found',
  })
  @Get('/dao/:id/balance')
  async getDaoStatsBalance(
    @Param() { id }: FindOneParams,
  ): Promise<StatsEntryDto[]> {
    return this.daoStatsService.getDaoStatsEntries(
      id,
      DaoStatsEntryFields.Balance,
    );
  }

  @ApiOperation({
    summary: 'Get DAO funds stats',
  })
  @ApiOkResponse({
    description: 'List of DAO funds stats',
    type: [StatsEntryDto],
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

  @ApiOperation({
    summary: 'Get DAO bounties stats',
  })
  @ApiOkResponse({
    description: 'List of DAO bounties count stats',
    type: [StatsEntryDto],
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

  @ApiOperation({
    summary: 'Get DAO NFTs count stats',
  })
  @ApiOkResponse({
    description: 'List of DAO NFTs count stats',
    type: [StatsEntryDto],
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

  @ApiOperation({
    summary: 'Get DAO proposals count stats',
  })
  @ApiOkResponse({
    description: 'List of DAO proposals count stats',
    type: [ProposalStatsEntryDto],
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
