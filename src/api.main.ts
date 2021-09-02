import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppService } from './app-service';
import { Transport } from '@nestjs/microservices';
import { EVENT_CACHE_QUEUE_NAME } from './common/constants';

export default class Api implements AppService {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('/api/v1');

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: EVENT_CACHE_QUEUE_NAME,
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
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        disableErrorMessages: false,
        validationError: { target: false },
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const configService = app.get(ConfigService);

    const port = configService.get('port');

    await app.startAllMicroservicesAsync();

    await app.listen(port);
  }
}
