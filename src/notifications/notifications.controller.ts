import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { EVENT_MESSAGE_PATTERN } from 'src/common/constants';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor() {}

  @EventPattern(EVENT_MESSAGE_PATTERN)
  async handleMessagePrinted(data: Record<string, unknown>) {
    this.logger.log(`Received message: ${data.text}`);

    //TODO: Handle NEAR Sputnik update events - notify subscribers on DAO/Proposal changes
  }
}
