import { Notification } from '../entities';

export interface AccountNotificationDto {
  id: string;
  notificationId: string;
  accountId: string;
  isMuted: boolean;
  isRead: boolean;
  notification?: Notification;
}
