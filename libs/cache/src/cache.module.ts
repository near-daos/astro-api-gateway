import { CacheModule as NestCacheModule, Module } from '@nestjs/common';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class HttpCacheModule {}
