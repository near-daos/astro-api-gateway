import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CacheService } from '@sputnik-v2/cache';
import {
  EVENT_API_DAO_UPDATE,
  EVENT_API_PROPOSAL_UPDATE,
  EVENT_DAO_UPDATE_NOTIFICATION,
} from '@sputnik-v2/common';

import { REDIS_SOCKET_EVENT_EMIT_ALL_NAME } from './websocket/redis-propagator/redis-propagator.constants';
import { RedisService } from './websocket/redis/redis.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly redisService: RedisService,
  ) {}

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return 'Sputnik v2 API v1.0';
  }

  @EventPattern(EVENT_DAO_UPDATE_NOTIFICATION, Transport.RMQ)
  async clearCache() {
    this.logger.log(`Clearing cache on DAO update.`);
    await this.cacheService.clearCache();
  }

  @EventPattern(EVENT_API_DAO_UPDATE, Transport.RMQ)
  async onDaoUpdate(data: Record<string, string[]>) {
    this.logger.log('Sending DAO updates to Websocket clients.');
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, {
      event: 'dao-update',
      data,
    });
  }

  @EventPattern(EVENT_API_PROPOSAL_UPDATE, Transport.RMQ)
  async onProposalUpdate(data: Record<string, string[]>) {
    this.logger.log('Sending Proposal updates to Websocket clients.');
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, {
      event: 'proposal-update',
      data,
    });
  }
}
