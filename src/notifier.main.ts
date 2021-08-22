import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AppService } from './app-service';
import { Transport } from '@nestjs/microservices';
import { EVENT_QUEUE_NAME } from './common/constants';
import { NotificationsModule } from './notifications/notifications.module';

export default class Notifier implements AppService {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(NotificationsModule, {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: EVENT_QUEUE_NAME,
        queueOptions: {
          durable: true,
        },
      },
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen(() =>
      console.log('Notifications Microservice is listening...'),
    );
  }
}
