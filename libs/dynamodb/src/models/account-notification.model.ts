import {
  AccountNotification,
  AccountNotificationDto,
  Notification,
  NotificationStatus,
  NotificationType,
} from '@sputnik-v2/notification';
import { buildEntityId } from '@sputnik-v2/utils';
import { NOTIFICATION_TTL } from '@sputnik-v2/common';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class AccountNotificationModel extends BaseModel {
  id: string;
  notification: NotificationModel;
  accountId: string;
  isPhone: boolean;
  isEmail: boolean;
  isMuted: boolean;
  isRead: boolean;
  ttl: number;
}

export class NotificationModel {
  id: string;
  targetId: string;
  signerId: string;
  type: NotificationType;
  status: NotificationStatus;
  metadata: Record<string, any>;
  timestamp: number;
}

export function mapAccountNotificationDtoToAccountNotificationModel(
  accountNotification: AccountNotificationDto,
): AccountNotificationModel {
  return {
    partitionId: accountNotification.accountId,
    entityId: buildEntityId(
      DynamoEntityType.AccountNotification,
      accountNotification.id,
    ),
    entityType: DynamoEntityType.AccountNotification,
    isArchived: false,
    creatingTimeStamp: Date.now(),
    processingTimeStamp: Date.now(),
    accountId: accountNotification.accountId,
    id: accountNotification.id,
    notification: mapNotificationToNotificationModel(
      accountNotification.notification,
    ),
    isPhone: accountNotification.isPhone,
    isEmail: accountNotification.isEmail,
    isMuted: accountNotification.isMuted,
    isRead: accountNotification.isRead,
    ttl: Math.round(Date.now() / 1000) + NOTIFICATION_TTL,
  };
}

export function mapAccountNotificationToAccountNotificationModel(
  accountNotification: AccountNotification,
): AccountNotificationModel {
  return {
    partitionId: accountNotification.accountId,
    entityId: buildEntityId(
      DynamoEntityType.AccountNotification,
      accountNotification.id,
    ),
    entityType: DynamoEntityType.AccountNotification,
    isArchived: !!accountNotification.isArchived,
    creatingTimeStamp: accountNotification.createdAt.getTime(),
    processingTimeStamp: accountNotification.updatedAt.getTime(),
    accountId: accountNotification.accountId,
    id: accountNotification.id,
    notification: mapNotificationToNotificationModel(
      accountNotification.notification,
    ),
    isPhone: accountNotification.isPhone,
    isEmail: accountNotification.isEmail,
    isMuted: accountNotification.isMuted,
    isRead: accountNotification.isRead,
    ttl: Math.round(Date.now() / 1000) + NOTIFICATION_TTL,
  };
}

export function mapNotificationToNotificationModel(
  notification: Notification,
): NotificationModel {
  return {
    id: notification.id,
    targetId: notification.targetId,
    signerId: notification.signerId,
    type: notification.type,
    status: notification.status,
    metadata: notification.metadata,
    timestamp: notification.timestamp,
  };
}
