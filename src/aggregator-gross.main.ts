import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { AggregatorGrossModule } from './aggregator/aggregator-gross.module';
import { Transport } from '@nestjs/microservices';
import { AggregatorGrossService } from './aggregator/aggregator-gross.service';

export default class AggregatorGross {
  private readonly logger = new Logger(AggregatorGross.name);

  async bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(AggregatorGrossModule, {
      transport: Transport.TCP,
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen(() =>
      this.logger.log('Aggregator Gross Microservice is listening...'),
    );

    app.get(AggregatorGrossService).aggregate();
  }
}
