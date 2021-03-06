import { Notification } from '../entities';

export interface AccountNotificationDto {
  id: string;
  notificationId: string;
  accountId: string;
  isMuted: boolean;
  isRead: boolean;
  isPhone: boolean;
  isEmail: boolean;
  notification?: Notification;
}
