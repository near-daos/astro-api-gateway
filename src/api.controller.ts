import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { CacheService } from './cache/service/cache.service';
import { EVENT_DAO_UPDATE_MESSAGE_PATTERN } from './common/constants';
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

  @EventPattern(EVENT_DAO_UPDATE_MESSAGE_PATTERN, Transport.RMQ)
  async onDaoUpdates(data: Record<string, string[]>) {
    this.logger.log(`Clearing cache on DAO update.`);
    await this.cacheService.clearCache();

    this.logger.log('Sending Websocket event.');
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, {
      event: 'dao-update',
      data,
    });
  }
}
