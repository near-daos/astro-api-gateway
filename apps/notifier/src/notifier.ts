import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Logger as PinoLogger } from 'nestjs-pino';

import { EVENT_NOTIFICATIONS_QUEUE_NAME } from '@sputnik-v2/common';

import { NotifierModule } from './notifier.module';

export default class Notifier {
  private readonly logger = new Logger(Notifier.name);

  async bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(NotifierModule, {
      transport: Transport.REDIS,
      bufferLogs: true,
      options: {
        url: process.env.REDIS_EVENT_URL,
        queue: EVENT_NOTIFICATIONS_QUEUE_NAME,
        queueOptions: {
          durable: true,
        },
      },
    });

    app.useLogger(app.get(PinoLogger));

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen();

    this.logger.log('Notifications Microservice is listening...');
  }
}
