import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as nearConfig } from './near-config';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as databaseDraft } from './database-draft';
import { default as redis } from './redis';

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
  database,
  nearConfig,
  databaseNearIndexer,
  databaseDraft,
  redis,
  draft,
];
