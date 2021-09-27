import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as nearConfig } from './near-config';

import { parseRedisUrl } from 'parse-redis-url-simple';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const api = registerAs('api', () => {
  const { host: redisHost, port: redisPort, database: redisDB } = parseRedisUrl(
    process.env.REDIS_SOCKET_URL,
  )?.[0];

  return {
    port: parseInt(process.env.PORT, 10),
    redisHost,
    redisPort,
    redisDB
  };
});

export default [api, configuration, database, nearConfig, databaseNearIndexer];
