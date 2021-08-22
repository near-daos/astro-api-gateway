import { Injectable } from '@nestjs/common';
import {
  ClientsModuleOptionsFactory,
  Transport,
  ClientProvider,
} from '@nestjs/microservices';
import { EVENT_QUEUE_NAME } from 'src/common/constants';

@Injectable()
export class RabbitMQConfigService implements ClientsModuleOptionsFactory {
  createClientOptions(): ClientProvider {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: EVENT_QUEUE_NAME,
      },
    };
  }
}
