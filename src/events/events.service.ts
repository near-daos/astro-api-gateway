import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EVENT_CLEAR_HTTP_CACHE_MESSAGE_PATTERN,
  EVENT_NOTIFICATION_SERVICE,
  EVENT_CACHE_SERVICE,
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
    @Inject(EVENT_CACHE_SERVICE)
    private readonly cacheEventClient: ClientProxy,
  ) {}

  async handleDaoUpdates(daoIds: string[]): Promise<any> {
    return Promise.all([
      this.sendDaoUpdates(daoIds),
      this.sendClearCacheEvent(),
    ]);
  }

  private async sendDaoUpdates(daoIds: string[]): Promise<void> {
    return this.sendEvent(
      this.notificationEventClient,
      new DaoUpdateMessage(daoIds),
    );
  }

  private async sendClearCacheEvent(): Promise<void> {
    return this.sendEvent(
      this.cacheEventClient,
      new BaseMessage(EVENT_CLEAR_HTTP_CACHE_MESSAGE_PATTERN, {}),
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
