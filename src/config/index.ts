import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as firebase } from './firebase';
import { default as nearConfig } from './near-config';

export { default as apiValidationSchema } from './api-validation-schema';
export { default as aggregatorValidationSchema } from './aggregator-validation-schema';
export { default as notifierValidationSchema } from './notifier-validation-schema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

export default [
  configuration,
  database,
  firebase,
  nearConfig,
  databaseNearIndexer,
];
