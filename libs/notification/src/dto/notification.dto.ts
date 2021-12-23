import { NotificationStatus, NotificationType } from '../types';

export interface NotificationDto {
  id: string;
  daoId: string;
  targetId: string;
  signerId: string;
  type: NotificationType;
  status?: NotificationStatus;
  metadata: Record<string, unknown>;
  timestamp: number;
}
