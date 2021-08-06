import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { config as awsConfig } from 'aws-sdk';
import { SputnikDaoService } from './sputnikdao/sputnik.service';
import { AggregatorService } from './aggregator/aggregator.service';
import { AggregatorModule } from './aggregator/aggregator.module';
import { AppService } from './app-service';

export default class Aggregator implements AppService {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.create(AggregatorModule);
    app.setGlobalPrefix("/api/v1");

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        disableErrorMessages: false,
        validationError: { target: false },
        transformOptions: {
          enableImplicitConversion: true
        }
      }),
    );

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    const configService = app.get(ConfigService);

    awsConfig.update({
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      region: configService.get('AWS_REGION'),
    });

    await app.get(SputnikDaoService).init();

    await app.get(AggregatorService).aggregate();

    const port = configService.get('port');

    await app.listen(port);
  }
}
