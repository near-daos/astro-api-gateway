import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags/feature-flags.module';
import { DynamodbModule } from '@sputnik-v2/dynamodb/dynamodb.module';

import {
  Notification,
  AccountNotification,
  AccountNotificationSettings,
} from './entities';
import { AccountNotificationService } from './account-notification.service';
import { AccountNotificationSettingsService } from './account-notification-settings.service';
import { AccountNotificationIdsDynamoService } from './account-notification-ids-dynamo.service';
import { DaoModule } from '@sputnik-v2/dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      AccountNotification,
      AccountNotificationSettings,
    ]),
    DaoModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [
    NotificationService,
    AccountNotificationService,
    AccountNotificationSettingsService,
    AccountNotificationIdsDynamoService,
  ],
  exports: [
    NotificationService,
    AccountNotificationService,
    AccountNotificationSettingsService,
    AccountNotificationIdsDynamoService,
  ],
})
export class NotificationModule {}
