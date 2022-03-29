import { CacheModule, Module } from '@nestjs/common';

import { AccountModule as AccountModuleLib } from '@sputnik-v2/account';
import { CacheConfigService } from '@sputnik-v2/config/cache';
import { OtpModule } from '@sputnik-v2/otp';

import { NearModule } from '../near/near.module';
import { AccountController } from './account.controller';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    AccountModuleLib,
    NearModule,
    OtpModule,
  ],
  controllers: [AccountController],
})
export class AccountModule {}
