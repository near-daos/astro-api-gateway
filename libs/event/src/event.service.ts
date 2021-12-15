import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  EVENT_NOTIFICATION_SERVICE,
  EVENT_API_SERVICE,
  EVENT_DAO_UPDATE_NOTIFICATION,
  EVENT_PROPOSAL_UPDATE_NOTIFICATION,
} from '@sputnik-v2/common';
import { DaoDto } from '@sputnik-v2/dao';
import { ProposalDto } from '@sputnik-v2/proposal';
import { TransactionAction } from '@sputnik-v2/transaction-handler';

import { BaseMessage } from './messages/base.event';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @Inject(EVENT_NOTIFICATION_SERVICE)
    private readonly notificationEventClient: ClientProxy,
    @Inject(EVENT_API_SERVICE)
    private readonly apiEventClient: ClientProxy,
  ) {}

  public async sendDaoUpdateNotificationEvent(
    dao: DaoDto,
    txAction: TransactionAction,
  ): Promise<any> {
    const message = new BaseMessage(EVENT_DAO_UPDATE_NOTIFICATION, {
      dao,
      txAction,
    });
    return this.sendEvent(this.notificationEventClient, message);
  }

  public async sendProposalUpdateNotificationEvent(
    proposal: ProposalDto,
    txAction: TransactionAction,
  ): Promise<any> {
    const message = new BaseMessage(EVENT_PROPOSAL_UPDATE_NOTIFICATION, {
      proposal,
      txAction,
    });
    return this.sendEvent(this.notificationEventClient, message);
  }

  private async sendEvent(
    client: ClientProxy,
    { pattern, data }: BaseMessage,
  ): Promise<void> {
    try {
      client.emit<any>(pattern, data);
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }
}
