import { Controller, Post, Param, UseGuards, Req, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Span } from 'nestjs-ddtrace';
import { Interval } from '@nestjs/schedule';

import {
  AccountAccessGuard,
  AdminGuard,
  AGGREGATOR_HANDLER_STATE_ID,
  AuthorizedRequest,
  FindOneParams,
} from '@sputnik-v2/common';
import { EventService } from '@sputnik-v2/event';
import {
  TransactionHandlerBlocks,
  TransactionHandlerService,
} from '@sputnik-v2/transaction-handler';
import { SocketService } from '@sputnik-v2/websocket';

@Span()
@ApiTags('Aggregator')
@Controller('aggregator')
export class AggregatorController {
  constructor(
    private readonly eventService: EventService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly socketService: SocketService,
  ) {}

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

  @ApiResponse({
    status: 200,
    description: 'Aggregator State Blocks',
    type: TransactionHandlerBlocks,
  })
  @ApiBearerAuth()
  @Get('/blocks')
  async getBlocks(): Promise<TransactionHandlerBlocks> {
    return this.transactionHandlerService.getHandlerBlocks(
      AGGREGATOR_HANDLER_STATE_ID,
    );
  }

  @Interval(5000)
  async emitBlocks() {
    this.socketService.emitToAllEvent({
      event: 'aggregator-blocks',
      data: await this.transactionHandlerService.getHandlerBlocks(
        AGGREGATOR_HANDLER_STATE_ID,
      ),
    });
  }
}
