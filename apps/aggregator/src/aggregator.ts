import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger, LogLevel } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

import { AggregatorModule } from './aggregator.module';
import { AggregatorService } from './aggregator.service';

export default class Aggregator {
  private readonly logger = new Logger(Aggregator.name);

  async bootstrap(): Promise<void> {
    const logger = [...(process.env.LOG_LEVELS.split(',') as LogLevel[])];
    const app = await NestFactory.createMicroservice(AggregatorModule, {
      transport: Transport.TCP,
      logger,
      options: {
        port: 3001,
      },
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen(() =>
      this.logger.log('Aggregator Microservice is listening...'),
    );

    // Run initial aggregation
    // app.get(AggregatorService).aggregateAllDaos();
  }
}
