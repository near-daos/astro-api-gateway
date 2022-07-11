import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { Logger as PinoLogger } from 'nestjs-pino';

import { EVENT_API_QUEUE_NAME } from '@sputnik-v2/common';

import { AppModule } from './api.module';
import { initAdapters } from './adapters.init';
import './tracing';

export default class Api {
  private readonly logger = new Logger(Api.name);

  async bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    app.enableCors();
    app.enableVersioning({
      defaultVersion: '1',
      type: VersioningType.URI,
    });
    app.setGlobalPrefix('/api');

    app.useLogger(app.get(PinoLogger));

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

    await app.startAllMicroservices();

    await app.listen(port, () =>
      this.logger.log('API Service is listening...'),
    );
  }
}
