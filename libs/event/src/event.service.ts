import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  EVENT_NOTIFICATION_SERVICE,
  EVENT_API_SERVICE,
  EVENT_DAO_UPDATE_NOTIFICATION,
  EVENT_PROPOSAL_UPDATE_NOTIFICATION,
  EVENT_NEW_NOTIFICATION,
  EVENT_NEW_COMMENT,
  EVENT_DELETE_COMMENT,
  EVENT_AGGREGATOR_SERVICE,
  EVENT_TRIGGER_DAO_AGGREGATION,
} from '@sputnik-v2/common';
import { DaoDto } from '@sputnik-v2/dao';
import { Proposal, ProposalDto } from '@sputnik-v2/proposal';
import { TransactionAction } from '@sputnik-v2/transaction-handler';
import { AccountNotification, Notification } from '@sputnik-v2/notification';
import { Comment } from '@sputnik-v2/comment';

import { BaseMessage } from './messages/base.event';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @Inject(EVENT_NOTIFICATION_SERVICE)
    private readonly notificationEventClient: ClientProxy,
    @Inject(EVENT_API_SERVICE)
    private readonly apiEventClient: ClientProxy,
    @Inject(EVENT_AGGREGATOR_SERVICE)
    private readonly aggregatorEventClient: ClientProxy,
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
    proposal: ProposalDto | Proposal,
    txAction: TransactionAction,
  ): Promise<any> {
    const message = new BaseMessage(EVENT_PROPOSAL_UPDATE_NOTIFICATION, {
      proposal,
      txAction,
    });
    return this.sendEvent(this.notificationEventClient, message);
  }

  public async sendNewNotificationEvent(
    notification: Notification,
    accountNotifications: AccountNotification[],
  ): Promise<void> {
    const message = new BaseMessage(EVENT_NEW_NOTIFICATION, {
      notification,
      accountNotifications: accountNotifications
        .filter(({ isMuted }) => !isMuted)
        .map((accountNotification) => ({
          accountId: accountNotification.accountId,
          data: accountNotification,
        })),
    });
    return this.sendEvent(this.apiEventClient, message);
  }

  public async sendNewCommentEvent(comment: Comment): Promise<void> {
    const message = new BaseMessage(EVENT_NEW_COMMENT, { comment });
    return this.sendEvent(this.apiEventClient, message);
  }

  public async sendDeleteCommentEvent(comment: Comment): Promise<void> {
    const message = new BaseMessage(EVENT_DELETE_COMMENT, { comment });
    return this.sendEvent(this.apiEventClient, message);
  }

  public async sendTriggerDaoAggregationEvent(
    daoId: string,
    accountId: string,
  ): Promise<void> {
    const message = new BaseMessage(EVENT_TRIGGER_DAO_AGGREGATION, {
      daoId,
      accountId,
    });
    return this.sendEvent(this.aggregatorEventClient, message);
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
