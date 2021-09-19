import { registerAs } from '@nestjs/config';
import { default as configuration } from './configuration';
import { default as database } from './database';
import databaseNearIndexer from './database-near-indexer';
import { default as nearConfig } from './near-config';

export { default as validate } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';
export { CacheConfigService } from './cache';

const api = registerAs('api', () => ({
  port: parseInt(process.env.PORT, 10),
}));

export default [api, configuration, database, nearConfig, databaseNearIndexer];
