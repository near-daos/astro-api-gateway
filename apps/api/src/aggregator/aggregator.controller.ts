import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  Get,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Span, TraceService } from 'nestjs-ddtrace';
import { Interval } from '@nestjs/schedule';

import {
  AccountAccessGuard,
  AdminGuard,
  AuthorizedRequest,
  FindOneParams,
  StatsDService,
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
  private readonly logger = new Logger(AggregatorController.name);

  private readonly statsDService = new StatsDService();

  constructor(
    private readonly eventService: EventService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly socketService: SocketService,
    private readonly traceService: TraceService,
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
    return this.transactionHandlerService.getHandlerBlocks();
  }

  @Interval(5000)
  async emitBlocks() {
    const currentSpan = this.traceService.getActiveSpan();

    const data: TransactionHandlerBlocks =
      await this.transactionHandlerService.getHandlerBlocks();

    const { lastBlock, lastAstroBlock, lastProcessedBlock, lastHandledBlock } =
      data;

    currentSpan.addTags({
      ...data,
    });

    this.logger.log(data);

    this.statsDService.client.gauge('block.lastBlock.height', lastBlock.height);
    this.statsDService.client.gauge(
      'block.lastBlock.timestamp',
      lastBlock.timestamp as number,
    );

    this.statsDService.client.gauge(
      'block.lastAstroBlock.height',
      lastAstroBlock.height,
    );
    this.statsDService.client.gauge(
      'block.lastAstroBlock.timestamp',
      lastAstroBlock.timestamp as number,
    );

    this.statsDService.client.gauge(
      'block.lastProcessedBlock.height',
      lastProcessedBlock.height,
    );
    this.statsDService.client.gauge(
      'block.lastProcessedBlock.timestamp',
      lastProcessedBlock.timestamp as number,
    );

    this.statsDService.client.gauge(
      'block.lag.height',
      lastAstroBlock.height - lastHandledBlock.height,
    );
    this.statsDService.client.gauge(
      'block.lag.time',
      (lastAstroBlock.timestamp as number) -
        (lastHandledBlock.timestamp as number),
    );

    this.socketService.emitToAllEvent({
      event: 'aggregator-blocks',
      data,
    });
  }
}
