import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  AccountAccessGuard,
  AdminGuard,
  AuthorizedRequest,
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
  @ApiBearerAuth()
  @UseGuards(AccountAccessGuard, AdminGuard)
  @Post('/aggregate-dao/:id')
  async triggerDaoAggregation(
    @Req() req: AuthorizedRequest,
    @Param() { id }: FindOneParams,
  ): Promise<void> {
    return this.eventService.sendTriggerDaoAggregationEvent(id, req.accountId);
  }
}
