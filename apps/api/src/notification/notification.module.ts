import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountNotificationService,
  Notification,
  NotificationService,
  AccountNotification,
  AccountNotificationSettings,
  AccountNotificationSettingsService,
} from '@sputnik-v2/notification';

import { NotificationController } from './notification.controller';
import { NearModule } from '../near/near.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      AccountNotification,
      AccountNotificationSettings,
    ]),
    NearModule,
  ],
  controllers: [NotificationController],
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
