import { CacheModule, Module } from '@nestjs/common';
import { DaoModule } from '@sputnik-v2/dao';
import { DaoSettingsModule } from '@sputnik-v2/dao-settings';
import { CacheConfigService } from '@sputnik-v2/config/api-config';
import { NearApiModule } from '@sputnik-v2/near-api';

import { DaoSettingsController } from './dao-settings.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    DaoModule,
    NearApiModule,
    DaoSettingsModule,
  ],
  controllers: [DaoSettingsController],
})
export class ApiDaoSettingsModule {}
