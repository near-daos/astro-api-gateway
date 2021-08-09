import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EVENT_SERVICE,
  EVENT_DAO_UPDATE_MESSAGE_PATTERN
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { DaoUpdateMessage } from './messages/dao-update.message';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @Inject(EVENT_SERVICE) private readonly client: ClientProxy
  ) { }

  async sendDaoUpdates(message: DaoUpdateMessage): Promise<void> {
    try {
      this.client.emit<any>(EVENT_DAO_UPDATE_MESSAGE_PATTERN, message);
    } catch (error) {
      this.logger.error(error);

      return Promise.reject(error);
    }
  }
}
