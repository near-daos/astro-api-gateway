import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import {
  EVENT_DAO_UPDATE_NOTIFICATION,
  EVENT_PROPOSAL_UPDATE_NOTIFICATION,
} from '@sputnik-v2/common';
import { DaoUpdateDto, ProposalUpdateDto } from '@sputnik-v2/event';
import { NotificationHandlerService } from './notification-handler/notification-handler.service';
import { AccountNotifierService } from './account-notifier/account-notifier.service';

@Controller()
export class NotifierController {
  private readonly logger = new Logger(NotifierController.name);

  constructor(
    private readonly notificationHandlerService: NotificationHandlerService,
    private readonly accountNotifierService: AccountNotifierService,
  ) {}

  @EventPattern(EVENT_DAO_UPDATE_NOTIFICATION, Transport.REDIS)
  async onDaoUpdate(data: DaoUpdateDto) {
    this.logger.log(`Received DAO updates: ${data.dao.id}`);

    const notification =
      await this.notificationHandlerService.handleDaoUpdateNotification(data);
    await this.accountNotifierService.notifyAccounts(notification);
  }

  @EventPattern(EVENT_PROPOSAL_UPDATE_NOTIFICATION, Transport.REDIS)
  async onProposalUpdate(data: ProposalUpdateDto) {
    this.logger.log(`Received Proposal updates: ${data.proposal.id}`);

    const notification =
      await this.notificationHandlerService.handleProposalUpdateNotification(
        data,
      );
    await this.accountNotifierService.notifyAccounts(notification);
  }
}
