import { Module } from '@nestjs/common';

import { NotificationModule } from '@sputnik-v2/notification';
import { SubscriptionModule } from '@sputnik-v2/subscription';
import { DaoModule } from '@sputnik-v2/dao';

import { AccountNotifierService } from './account-notifier.service';

@Module({
  imports: [SubscriptionModule, NotificationModule, DaoModule],
  providers: [AccountNotifierService],
  exports: [AccountNotifierService],
})
export class AccountNotifierModule {}
