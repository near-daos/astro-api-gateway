import { CacheModule, Module } from '@nestjs/common';
import { BountyModule as BountyModuleLib } from '@sputnik-v2/bounty';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { DaoModule } from '@sputnik-v2/dao';
import { NearApiModule } from '@sputnik-v2/near-api';

import { BountyController } from './bounty.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    DaoModule,
    NearApiModule,
    BountyModuleLib,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
