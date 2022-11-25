import {
  AccountNotification,
  Notification,
  NotificationStatus,
  NotificationType,
} from '@sputnik-v2/notification';
import { buildEntityId } from '@sputnik-v2/utils';
import { NOTIFICATION_TTL } from '@sputnik-v2/common';
import { BaseModel } from './base.model';
import { BaseEntity, DynamoEntityType } from '../types';

export class AccountNotificationModel extends BaseModel {
  id: string;
  notification: NotificationModel;
  accountId: string;
  isPhone: boolean;
  isEmail: boolean;
  isMuted: boolean;
  isRead: boolean;
  ttl?: number;
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

export function mapAccountNotificationToAccountNotificationModel(
  accountNotification: Partial<AccountNotification | AccountNotificationModel>,
): Partial<AccountNotificationModel> & BaseEntity {
  const partitionId =
    (accountNotification as AccountNotificationModel).partitionId ||
    accountNotification.accountId;
  const ttl =
    (accountNotification as AccountNotificationModel).ttl ||
    Math.round(Date.now() / 1000) + NOTIFICATION_TTL; // expires after 2 weeks
  return {
    partitionId,
    entityId: buildEntityId(
      DynamoEntityType.AccountNotification,
      accountNotification.id,
    ),
    entityType: DynamoEntityType.AccountNotification,
    isArchived: !!accountNotification.isArchived,
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
    ttl,
  };
}

export function mapNotificationToNotificationModel(
  notification: Notification | NotificationModel,
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
