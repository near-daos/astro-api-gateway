import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as nearConfig } from './near-config';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const aggregator = registerAs('aggregator', () => ({
  pollingInterval: parseInt(process.env.AGGREGATOR_POLLING_INTERVAL, 10),
  daoPollingInterval: parseInt(process.env.DAO_POLLING_INTERVAL, 10),
}));

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  aggregator,
];
