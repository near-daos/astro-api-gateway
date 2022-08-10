import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as nearConfig } from './near-config';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const indexerProcessor = registerAs('indexer-processor', () => ({
  indexerRedisHost: process.env.INDEXER_REDIS_HOST,
  indexerRedisPort: parseInt(process.env.INDEXER_REDIS_PORT, 10),
  indexerRedisUsername: process.env.INDEXER_REDIS_USERNAME,
  indexerRedisPassword: process.env.INDEXER_REDIS_PASSWORD,
  indexerRedisDb: parseInt(process.env.INDEXER_REDIS_DATABASE, 10),
}));

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  indexerProcessor,
];
