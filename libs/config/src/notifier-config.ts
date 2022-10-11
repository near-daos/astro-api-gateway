import { default as configuration } from './configuration';
import { default as database } from './database';
import { default as notifi } from './notifi';
export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';
import databaseNearIndexer from './database-near-indexer';
import { default as nearConfig } from './near-config';
import launchdarkly from './launchdarkly';

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  notifi,
  launchdarkly,
];
