import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EVENT_SERVICE,
  EVENT_MESSAGE_PATTERN
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Message } from '../events/types/message.event';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @Inject(EVENT_SERVICE) private readonly client: ClientProxy
  ) { }

  async send(message: Message): Promise<void> {
    try {
      this.client.emit<any>(EVENT_MESSAGE_PATTERN, message);
    } catch (error) {
      this.logger.error('An error occurred while sending event message.');
      this.logger.error(error);
    }
  }
}
