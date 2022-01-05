import { Controller, Post, Param, UseGuards, Body } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  AccountAccessGuard,
  AccountBearer,
  AdminGuard,
  FindOneParams,
} from '@sputnik-v2/common';
import { EventService } from '@sputnik-v2/event';

@ApiTags('Aggregator')
@Controller('aggregator')
export class AggregatorController {
  constructor(private readonly eventService: EventService) {}

  @ApiParam({
    name: 'id',
    type: String,
    description: 'DAO ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Aggregation Triggered',
  })
  @UseGuards(AccountAccessGuard, AdminGuard)
  @Post('/aggregate-dao/:id')
  async createCommentReport(
    @Param() { id }: FindOneParams,
    @Body() body: AccountBearer,
  ): Promise<void> {
    return this.eventService.sendTriggerDaoAggregationEvent(id, body.accountId);
  }
}
