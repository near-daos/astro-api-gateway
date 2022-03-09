import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import {
  EVENT_DAO_UPDATE_NOTIFICATION,
  EVENT_PROPOSAL_UPDATE_NOTIFICATION,
} from '@sputnik-v2/common';
import {
  DaoUpdateDto,
  EventService,
  ProposalUpdateDto,
} from '@sputnik-v2/event';
import { NotificationHandlerService } from './notification-handler/notification-handler.service';
import { AccountNotifierService } from './account-notifier/account-notifier.service';
import { SmsService } from '@sputnik-v2/sms';

@Controller()
export class NotifierController {
  private readonly logger = new Logger(NotifierController.name);

  constructor(
    private readonly notificationHandlerService: NotificationHandlerService,
    private readonly accountNotifierService: AccountNotifierService,
    private readonly eventService: EventService,
    private readonly smsService: SmsService,
  ) {}

  @EventPattern(EVENT_DAO_UPDATE_NOTIFICATION, Transport.REDIS)
  async onDaoUpdate(data: DaoUpdateDto) {
    this.logger.log(`Received DAO updates: ${data.dao.id}`);

    const notification =
      await this.notificationHandlerService.handleDaoUpdateNotification(data);

    if (notification) {
      const accountNotifications =
        await this.accountNotifierService.notifyAccounts(notification);
      await this.eventService.sendNewNotificationEvent(
        notification,
        accountNotifications,
      );
      await this.smsService.sendSmsNotification(
        notification,
        accountNotifications,
      );
    }
  }

  @EventPattern(EVENT_PROPOSAL_UPDATE_NOTIFICATION, Transport.REDIS)
  async onProposalUpdate(data: ProposalUpdateDto) {
    this.logger.log(`Received Proposal updates: ${data.proposal.id}`);

    const notification =
      await this.notificationHandlerService.handleProposalUpdateNotification(
        data,
      );

    if (notification) {
      const accountNotifications =
        await this.accountNotifierService.notifyAccounts(notification);
      await this.eventService.sendNewNotificationEvent(
        notification,
        accountNotifications,
      );
      await this.smsService.sendSmsNotification(
        notification,
        accountNotifications,
      );
    }
  }
}
