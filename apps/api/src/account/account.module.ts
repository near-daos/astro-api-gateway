import { Module } from '@nestjs/common';
import { AccountModule as AccountModuleLib } from '@sputnik-v2/account';

import { NearModule } from '../near/near.module';
import { AccountController } from './account.controller';

@Module({
  imports: [NearModule, AccountModuleLib],
  controllers: [AccountController],
})
export class AccountModule {}
