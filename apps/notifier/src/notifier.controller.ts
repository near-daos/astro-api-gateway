import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { EVENT_DAO_UPDATE_NOTIFICATION } from '@sputnik-v2/common';

import { NotifierService } from './notifier.service';

@Controller()
export class NotifierController {
  private readonly logger = new Logger(NotifierController.name);

  constructor(private readonly notifierService: NotifierService) {}

  @EventPattern(EVENT_DAO_UPDATE_NOTIFICATION, Transport.RMQ)
  async handleDaoUpdates(data: Record<string, string[]>) {
    const { daoIds } = data;
    this.logger.log(`Received DAO updates: ${daoIds}`);

    //TODO: To be re-worked - combine notifications between councelors/subscribers etc...

    await Promise.all(
      daoIds.map((daoId) => this.notifierService.notifyDaoCouncelors(daoId)),
    );

    await Promise.all(
      daoIds.map((daoId) => this.notifierService.notifyDaoSubscribers(daoId)),
    );
  }
}
