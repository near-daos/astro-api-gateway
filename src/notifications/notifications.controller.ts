import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';

import { EVENT_DAO_UPDATE_MESSAGE_PATTERN } from 'src/common/constants';
import { NotificationService } from './notifications.service';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(EVENT_DAO_UPDATE_MESSAGE_PATTERN, Transport.RMQ)
  async handleDaoUpdates(data: Record<string, string[]>) {
    const { daoIds } = data;
    this.logger.log(`Received DAO updates: ${daoIds}`);

    //TODO: To be re-worked - combine notifications between councelors/subscribers etc...

    await Promise.all(
      daoIds.map((daoId) =>
        this.notificationService.notifyDaoCouncelors(daoId),
      ),
    );

    await Promise.all(
      daoIds.map((daoId) =>
        this.notificationService.notifyDaoSubscribers(daoId),
      ),
    );
  }
}
