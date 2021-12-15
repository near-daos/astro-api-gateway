import { NotificationType } from '../types';

export interface NotificationDto {
  id: string;
  daoId: string;
  targetId: string;
  type: NotificationType;
  metadata: Record<string, unknown>;
  timestamp: number;
}
