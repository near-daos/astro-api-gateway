import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AggregatorService } from './aggregator/aggregator.service';
import { AggregatorModule } from './aggregator/aggregator.module';
import { AppService } from './app-service';
import { Transport } from '@nestjs/microservices';

export default class Aggregator implements AppService {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AggregatorModule, {
      transport: Transport.TCP,
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const configService = app.get(ConfigService);

    await app.get(AggregatorService).aggregate();

    const port = configService.get('port');

    await app.listen(port);
  }
}
