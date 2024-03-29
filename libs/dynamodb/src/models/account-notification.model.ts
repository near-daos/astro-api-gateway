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
import { DynamoEntityType, PartialEntity } from '../types';

export class AccountNotificationModel extends BaseModel {
  id: string;
  notification: NotificationModel;
  daoId: string;
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
  timestamp: string; // nanoseconds
}

export function mapAccountNotificationDtoToAccountNotificationModel(
  accountNotification: Partial<AccountNotificationDto>,
): PartialEntity<AccountNotificationModel> {
  return {
    partitionId: accountNotification.accountId,
    entityId: buildEntityId(
      DynamoEntityType.AccountNotification,
      accountNotification.id,
    ),
    entityType: DynamoEntityType.AccountNotification,
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    daoId: accountNotification.notification.daoId,
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
  accountNotification: Partial<AccountNotification>,
): PartialEntity<AccountNotificationModel> {
  return {
    partitionId: accountNotification.accountId,
    entityId: buildEntityId(
      DynamoEntityType.AccountNotification,
      accountNotification.id,
    ),
    entityType: DynamoEntityType.AccountNotification,
    isArchived: !!accountNotification.isArchived,
    createdAt: accountNotification.createdAt
      ? accountNotification.createdAt.getTime()
      : undefined,
    updatedAt: accountNotification.updatedAt
      ? accountNotification.updatedAt.getTime()
      : undefined,
    accountId: accountNotification.accountId,
    daoId: accountNotification.notification.daoId,
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
