import { CacheModule as NestCacheModule, Module } from '@nestjs/common';

import { CacheConfigService } from '../config';
import { CacheService } from './service/cache.service';
import { CacheController } from './controller/cache.controller';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useClass: CacheConfigService,
    })
  ],
  controllers: [CacheController],
  providers: [CacheService]
})
export class HttpCacheModule { }
