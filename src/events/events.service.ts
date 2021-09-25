import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EVENT_NOTIFICATION_SERVICE,
  EVENT_API_SERVICE,
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { DaoUpdateMessage } from './messages/dao-update.message';
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

  async handleDaoUpdates(daoIds: string[]): Promise<any> {
    const message = new DaoUpdateMessage(daoIds);

    return Promise.all([
      this.sendEvent(this.notificationEventClient, message),
      this.sendEvent(this.apiEventClient, message),
    ]);
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
