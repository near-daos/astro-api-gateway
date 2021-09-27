import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EVENT_NOTIFICATION_SERVICE,
  EVENT_API_SERVICE,
  EVENT_API_DAO_UPDATE,
  EVENT_API_PROPOSAL_UPDATE,
  EVENT_DAO_UPDATE_NOTIFICATION,
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { BaseMessage } from './messages/base.event';
import { DaoDto } from 'src/daos/dto/dao.dto';
import { ProposalDto } from 'src/proposals/dto/proposal.dto';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @Inject(EVENT_NOTIFICATION_SERVICE)
    private readonly notificationEventClient: ClientProxy,
    @Inject(EVENT_API_SERVICE)
    private readonly apiEventClient: ClientProxy,
  ) {}

  public async sendDaoUpdateNotificationEvent(daoIds: string[]): Promise<any> {
    const message = new BaseMessage(EVENT_DAO_UPDATE_NOTIFICATION, { daoIds });

    return Promise.all([
      this.sendEvent(this.notificationEventClient, message),
      this.sendEvent(this.apiEventClient, message),
    ]);
  }

  public async sendDaoUpdates(daos: DaoDto[]): Promise<any> {
    return this.sendEvent(
      this.apiEventClient,
      new BaseMessage(EVENT_API_DAO_UPDATE, { daos }),
    );
  }

  public async sendProposalUpdates(proposals: ProposalDto[]): Promise<any> {
    return this.sendEvent(
      this.apiEventClient,
      new BaseMessage(EVENT_API_PROPOSAL_UPDATE, { proposals }),
    );
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
