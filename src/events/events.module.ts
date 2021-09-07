import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  EVENT_CACHE_QUEUE_NAME,
  EVENT_CACHE_SERVICE,
  EVENT_NOTIFICATIONS_QUEUE_NAME,
  EVENT_NOTIFICATION_SERVICE,
} from 'src/common/constants';
import { EventService } from './events.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EVENT_NOTIFICATION_SERVICE,
        useFactory: async () => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL],
              queue: EVENT_NOTIFICATIONS_QUEUE_NAME,
            },
          };
        },
      },
      {
        name: EVENT_CACHE_SERVICE,
        useFactory: async () => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL],
              queue: EVENT_CACHE_QUEUE_NAME,
            },
          };
        },
      },
    ]),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
