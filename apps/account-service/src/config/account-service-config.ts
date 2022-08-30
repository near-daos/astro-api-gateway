import { registerAs } from '@nestjs/config';

import { default as configuration } from './configuration';
import { default as nearConfig } from './near-config';
import { default as database } from './database';
import { default as redis } from './redis';

export { CacheConfigService } from './cache';
export { TypeOrmConfigService } from './typeorm-config.service';
export { default as validate } from './validationSchema';

const accountService = registerAs('account-service', () => ({
  port: parseInt(process.env.PORT, 10),
  rateTtl: parseInt(process.env.API_RATE_TTL, 10) || 60,
  rateLimit: parseInt(process.env.API_RATE_LIMIT, 10) || 5,
}));

export default [configuration, database, nearConfig, redis, accountService];
