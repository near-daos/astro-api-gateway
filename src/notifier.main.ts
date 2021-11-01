import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger, LogLevel } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { EVENT_NOTIFICATIONS_QUEUE_NAME } from './common/constants';
import { NotificationsModule } from './notifications/notifications.module';

export default class Notifier {
  private readonly logger = new Logger(Notifier.name);

  async bootstrap(): Promise<void> {
    const logger = [...(process.env.LOG_LEVELS.split(',') as LogLevel[])];
    const app = await NestFactory.createMicroservice(NotificationsModule, {
      transport: Transport.RMQ,
      logger,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: EVENT_NOTIFICATIONS_QUEUE_NAME,
        queueOptions: {
          durable: true,
        },
      },
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen(() =>
      this.logger.log('Notifications Microservice is listening...'),
    );
  }
}
