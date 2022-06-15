import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  Logger,
  LogLevel,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import morgan from 'morgan';

import { EVENT_API_QUEUE_NAME } from '@sputnik-v2/common';

import { AppModule } from './api.module';
import { initAdapters } from './adapters.init';

export default class Api {
  private readonly logger = new Logger(Api.name);

  async bootstrap(): Promise<void> {
    const logger = [...(process.env.LOG_LEVELS.split(',') as LogLevel[])];
    const app = await NestFactory.create(AppModule, {
      logger,
    });
    app.enableCors();
    app.setGlobalPrefix('/api/v1');

    if (logger.includes('debug')) {
      app.use(morgan('tiny'));
    }

    initAdapters(app);

    app.connectMicroservice({
      transport: Transport.REDIS,
      options: {
        url: process.env.REDIS_EVENT_URL,
        queue: EVENT_API_QUEUE_NAME,
        queueOptions: {
          durable: true,
        },
      },
    });

    if (process.env.NODE_ENV === 'development') {
      (app as any).httpAdapter.instance.set('json spaces', 2);
    }

    const config = new DocumentBuilder()
      .setTitle('Sputnik v2 API')
      .setDescription('Sputnik v2 API Backend Server')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        disableErrorMessages: false,
        validationError: { target: false },
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const configService = app.get(ConfigService);

    const { port } = configService.get('api');

    await app.startAllMicroservicesAsync();

    await app.listen(port, () =>
      this.logger.log('API Service is listening...'),
    );
  }
}
