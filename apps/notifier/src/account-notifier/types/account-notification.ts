import { buildAccountNotificationId } from '@sputnik-v2/utils';
import { Notification, AccountNotificationDto } from '@sputnik-v2/notification';

export function castAccountNotification(
  accountId: string,
  notification: Notification,
  isDisabled: boolean,
): AccountNotificationDto {
  return {
    id: buildAccountNotificationId(accountId, notification.id),
    notificationId: notification.id,
    notification,
    accountId: accountId,
    isMuted: isDisabled,
    isRead: isDisabled,
  };
}
