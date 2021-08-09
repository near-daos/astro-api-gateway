import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { EVENT_DAO_UPDATE_MESSAGE_PATTERN } from 'src/common/constants';
import { NotificationService } from './notifications.service';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(EVENT_DAO_UPDATE_MESSAGE_PATTERN)
  async handleDaoUpdates(data: Record<string, string[]>) {
    const { daoIds } = data;
    this.logger.log(`Received DAO updates: ${daoIds}`);

    await Promise.all(daoIds.map(daoId => this.notificationService.notifyDaoSubscribers(daoId)));
  }
}
