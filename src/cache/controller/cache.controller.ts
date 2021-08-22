import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';

import { EVENT_CLEAR_HTTP_CACHE_MESSAGE_PATTERN } from 'src/common/constants';
import { CacheService } from 'src/cache/service/cache.service';

@Controller()
export class CacheController {
  private readonly logger = new Logger(CacheController.name);

  constructor(private readonly cacheService: CacheService) {}

  @EventPattern(EVENT_CLEAR_HTTP_CACHE_MESSAGE_PATTERN, Transport.RMQ)
  async handleDaoUpdates(data: Record<string, string[]>) {
    this.logger.log(`Clearing cache on DAO update`);

    await this.cacheService.clearCache();
  }
}
