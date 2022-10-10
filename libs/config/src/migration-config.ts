import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as databaseDraft } from './database-draft';
import { default as nearConfig } from './near-config';
import opensearch from './opensearch';
import dynamodb from './dynamodb';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

export default [
  configuration,
  database,
  nearConfig,
  databaseNearIndexer,
  opensearch,
  databaseDraft,
  dynamodb,
];
