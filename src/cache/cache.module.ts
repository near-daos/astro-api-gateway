import { CacheModule as NestCacheModule, Module } from '@nestjs/common';

import { CacheConfigService } from '../config/api-config';
import { CacheService } from './service/cache.service';

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
