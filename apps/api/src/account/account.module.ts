import { CacheModule, Module } from '@nestjs/common';

import { AccountModule as AccountModuleLib } from '@sputnik-v2/account';
import { CacheConfigService } from '@sputnik-v2/config/cache';
import { NearApiModule } from '@sputnik-v2/near-api';
import { OtpModule } from '@sputnik-v2/otp';

import { AccountController } from './account.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    OtpModule,
    NearApiModule,
    AccountModuleLib,
  ],
  controllers: [AccountController],
})
export class AccountModule {}
