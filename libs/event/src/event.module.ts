import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  EVENT_API_QUEUE_NAME,
  EVENT_API_SERVICE,
  EVENT_NOTIFICATIONS_QUEUE_NAME,
  EVENT_NOTIFICATION_SERVICE,
} from '@sputnik-v2/common';

import { EventService } from './event.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EVENT_NOTIFICATION_SERVICE,
        useFactory: async () => {
          return {
            transport: Transport.REDIS,
            options: {
              url: process.env.REDIS_EVENT_URL,
              queue: EVENT_NOTIFICATIONS_QUEUE_NAME,
            },
          };
        },
      },
      {
        name: EVENT_API_SERVICE,
        useFactory: async () => {
          return {
            transport: Transport.REDIS,
            options: {
              url: process.env.REDIS_EVENT_URL,
              queue: EVENT_API_QUEUE_NAME,
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
