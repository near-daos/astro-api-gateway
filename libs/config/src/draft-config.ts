import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as nearConfig } from './near-config';
import databaseNearIndexer from './database-near-indexer';
import { default as databaseDraft } from './database-draft';
import { default as redis } from './redis';
import { default as daoApi } from './dao-api';
import opensearch from './opensearch';
import launchdarkly from './launchdarkly';
import dynamodb from './dynamodb';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const draft = registerAs('draft', () => {
  return {
    port: parseInt(process.env.PORT, 10),
    rateTtl: parseInt(process.env.API_RATE_TTL, 10) || 60,
    rateLimit: parseInt(process.env.API_RATE_LIMIT, 10) || 5,
  };
});

export default [
  configuration,
  daoApi,
  nearConfig,
  databaseNearIndexer,
  databaseDraft,
  redis,
  draft,
  opensearch,
  dynamodb,
  launchdarkly,
];
