import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { AggregatorModule } from './aggregator/aggregator.module';
import { Transport } from '@nestjs/microservices';
import { AggregatorService } from './aggregator/aggregator.service';

export default class Aggregator {
  private readonly logger = new Logger(Aggregator.name);

  async bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AggregatorModule, {
      transport: Transport.TCP,
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen(() =>
      this.logger.log('Aggregator Microservice is listening...'),
    );

    app.get(AggregatorService).aggregate();
  }
}
