import { Logger as PinoLogger } from 'nestjs-pino';

import { RedisStreamStrategy } from '@mark_hoog/redis-streams-transport';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { CustomStrategy } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ServiceModule } from './service.module';
import { AggregatorService } from './aggregator/aggregator.service';

export default class Service {
  private readonly logger = new Logger(Service.name);

  async bootstrap(): Promise<void> {
    const app = await NestFactory.create(ServiceModule, {
      bufferLogs: true,
    });
    app.enableCors();
    app.setGlobalPrefix('/api/v1');

    app.useLogger(app.get(PinoLogger));

    if (process.env.NODE_ENV === 'development') {
      (app as any).httpAdapter.instance.set('json spaces', 2);
    }

    const config = new DocumentBuilder()
      .setTitle('Astro Account Service API')
      .setDescription('Astro Account Service API Backend Server')
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

    await app.startAllMicroservices();

    const configService = app.get(ConfigService);

    const { port } = configService.get('account-service');
    const { url, consumerGroup } = configService.get('redis-stream');

    app.connectMicroservice<CustomStrategy>({
      strategy: new RedisStreamStrategy({
        url,
        consumerGroup,
        consumer: 'astro_account_service',
      }),
    });

    await app.startAllMicroservices();

    await app.listen(port, () =>
      this.logger.log('Account Service is listening...'),
    );

    // Run initial aggregation
    app.get(AggregatorService).aggregateKYCs();
  }
}
