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
  tokenPollingInterval: parseInt(
    process.env.AGGREGATOR_TOKEN_POLLING_INTERVAL,
    10,
  ),
  tokenPricesPollingInterval: parseInt(
    process.env.AGGREGATOR_TOKEN_PRICES_POLLING_INTERVAL,
    10,
  ),
  daoStatusPollingInterval: parseInt(
    process.env.AGGREGATOR_DAO_STATUS_POLLING_INTERVAL,
    10,
  ),
  daoStatsCronTime: process.env.AGGREGATOR_DAO_STATS_CRON_TIME,
}));

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  aggregator,
];
