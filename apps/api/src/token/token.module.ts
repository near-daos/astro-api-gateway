import { CacheModule, Module } from '@nestjs/common';
import { TokenModule as TokenModuleLib } from '@sputnik-v2/token';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { TokenController } from './token.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TokenModuleLib,
  ],
  controllers: [TokenController],
})
export class TokenModule {}
