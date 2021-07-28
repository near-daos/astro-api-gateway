import { CacheModuleOptions, CacheOptionsFactory, Injectable } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      store: redisStore,
      //TODO: Use REDIS URI instead
      host: 'localhost',
      port: 6379,
      auth_pass: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_HTTP_CACHE_DB,
      ttl: parseInt(process.env.REDIS_HTTP_CACHE_TTL)
    };
  }
}
