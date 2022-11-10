import { CacheModule, Module } from '@nestjs/common';
import { BountyModule as BountyModuleLib } from '@sputnik-v2/bounty';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { DaoModule } from '@sputnik-v2/dao';

import { NearModule } from '../near/near.module';
import { BountyController } from './bounty.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    DaoModule,
    NearModule,
    BountyModuleLib,
  ],
  controllers: [BountyController],
})
export class BountyModule {}
