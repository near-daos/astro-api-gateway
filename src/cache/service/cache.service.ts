import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async clearCache(): Promise<any> {
    return this.cacheManager.reset();
  }
}
