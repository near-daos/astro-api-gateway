import { parseRedisUrl } from 'parse-redis-url-simple';

import { registerAs } from '@nestjs/config';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

export default registerAs('redis-stream', () => ({
  url: process.env.REDIS_EVENT_URL,
  consumerGroup:
    process.env.REDIS_INDEXER_CONSUMER_GROUP || 'account_service_group',
}));
