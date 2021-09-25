import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      store: redisStore,
      url: process.env.REDIS_CACHE_URL,
      ttl: parseInt(process.env.REDIS_HTTP_CACHE_TTL),
    };
  }
}
