import {
  AccountNotificationsDto,
  Notification,
} from '@sputnik-v2/notification';

export class NewNotificationDto {
  notification: Notification;
  accountNotifications: AccountNotificationsDto[];
}
