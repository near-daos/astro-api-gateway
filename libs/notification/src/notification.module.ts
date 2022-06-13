import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Notification,
  AccountNotification,
  AccountNotificationSettings,
} from './entities';
import { AccountNotificationService } from './account-notification.service';
import { AccountNotificationSettingsService } from './account-notification-settings.service';
import { DaoModule } from '@sputnik-v2/dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      AccountNotification,
      AccountNotificationSettings,
    ]),
    DaoModule,
  ],
  providers: [
    NotificationService,
    AccountNotificationService,
    AccountNotificationSettingsService,
  ],
  exports: [
    NotificationService,
    AccountNotificationService,
    AccountNotificationSettingsService,
  ],
})
export class NotificationModule {}
