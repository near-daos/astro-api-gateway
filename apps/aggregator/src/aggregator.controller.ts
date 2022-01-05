import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';

import { TriggerDaoAggregationDto } from '@sputnik-v2/event';
import { EVENT_TRIGGER_DAO_AGGREGATION } from '@sputnik-v2/common';

import { AggregatorService } from './aggregator.service';

@Controller()
export class AggregatorController {
  private readonly logger = new Logger(AggregatorController.name);

  constructor(private readonly aggregatorService: AggregatorService) {}

  @EventPattern(EVENT_TRIGGER_DAO_AGGREGATION, Transport.REDIS)
  async triggerDaoAggregation({ daoId, accountId }: TriggerDaoAggregationDto) {
    this.logger.log(
      `Triggered aggregation for DAO: ${daoId}, triggered by account: ${accountId}`,
    );
    await this.aggregatorService.aggregateDaoById(daoId);
  }
}
