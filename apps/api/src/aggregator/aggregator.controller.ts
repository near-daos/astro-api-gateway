import { Controller, Post, Param } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FindOneParams } from '@sputnik-v2/common';
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
  @Post('/aggregate-dao/:id')
  async createCommentReport(@Param() { id }: FindOneParams): Promise<void> {
    return this.eventService.sendTriggerDaoAggregationEvent(id);
  }
}
