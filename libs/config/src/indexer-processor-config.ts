import { parseRedisUrl } from 'parse-redis-url-simple';
import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as nearConfig } from './near-config';
import opensearch from './opensearch';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const indexerProcessor = registerAs('indexer-processor', () => {
  const {
    host: indexerRedisHost,
    port: indexerRedisPort,
    database: indexerRedisDb,
    password: indexerRedisPassword,
  } = parseRedisUrl(process.env.REDIS_CONNECTION_STRING)?.[0];

  return {
    indexerRedisHost,
    indexerRedisPort,
    indexerRedisDb,
    indexerRedisPassword,
  };
});

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  indexerProcessor,
  opensearch,
];
