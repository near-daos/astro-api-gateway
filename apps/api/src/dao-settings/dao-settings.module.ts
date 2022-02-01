import { CacheModule, Module } from '@nestjs/common';
import { DaoModule } from '@sputnik-v2/dao';
import { DaoSettingsModule } from '@sputnik-v2/dao-settings';
import { CacheConfigService } from '@sputnik-v2/config/api-config';

import { DaoSettingsController } from './dao-settings.controller';
import { NearModule } from '../near/near.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    DaoModule,
    DaoSettingsModule,
    NearModule,
  ],
  controllers: [DaoSettingsController],
})
export class ApiDaoSettingsModule {}
