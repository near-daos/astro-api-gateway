import { Module } from '@nestjs/common';

import { NotificationModule } from '@sputnik-v2/notification';
import { SubscriptionModule } from '@sputnik-v2/subscription';
import { DaoModule } from '@sputnik-v2/dao';
import { AccountModule } from '@sputnik-v2/account';

import { AccountNotifierService } from './account-notifier.service';
import { EventModule } from '@sputnik-v2/event';

@Module({
  imports: [
    SubscriptionModule,
    NotificationModule,
    DaoModule,
    EventModule,
    AccountModule,
  ],
  providers: [AccountNotifierService],
  exports: [AccountNotifierService],
})
export class AccountNotifierModule {}
