import {
  AccountNotification,
  Notification,
  NotificationStatus,
  NotificationType,
} from '@sputnik-v2/notification';
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
  accountNotification: Partial<AccountNotification>,
): Partial<AccountNotificationModel> {
  return {
    partitionId: accountNotification.accountId,
    entityId: `${DynamoEntityType.AccountNotification}:${accountNotification.id}`,
    entityType: DynamoEntityType.AccountNotification,
    isArchived: accountNotification.isArchived,
    id: accountNotification.id,
    notification: mapNotificationToNotificationModel(
      accountNotification.notification,
    ),
    isPhone: accountNotification.isPhone,
    isEmail: accountNotification.isEmail,
    isMuted: accountNotification.isMuted,
    isRead: accountNotification.isRead,
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
