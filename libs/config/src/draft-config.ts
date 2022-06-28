import { parseRedisUrl } from 'parse-redis-url-simple';
import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as nearConfig } from './near-config';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as databaseDraft } from './database-draft';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const draft = registerAs('draft', () => {
  const {
    host: redisHost,
    port: redisPort,
    database: redisDB,
    password: redisPassword,
  } = parseRedisUrl(process.env.REDIS_SOCKET_URL)?.[0];

  return {
    port: parseInt(process.env.PORT, 10),
    rateTtl: parseInt(process.env.API_RATE_TTL, 10) || 60,
    rateLimit: parseInt(process.env.API_RATE_LIMIT, 10) || 5,
    redisHost,
    redisPort,
    redisDB,
    redisPassword,
  };
});

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  databaseDraft,
  draft,
];
