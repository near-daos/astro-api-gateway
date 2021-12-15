import { buildAccountNotificationId } from '@sputnik-v2/utils';
import { Notification, AccountNotificationDto } from '@sputnik-v2/notification';

export function castAccountNotification(
  accountId: string,
  notification: Notification,
): AccountNotificationDto {
  return {
    id: buildAccountNotificationId(accountId, notification.id),
    notificationId: notification.id,
    accountId: accountId,
    isMuted: false,
    isRead: false,
  };
}
