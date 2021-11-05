import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger, LogLevel } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

import { AggregatorDaoModule } from './aggregator-dao.module';
import { AggregatorDaoService } from './aggregator-dao.service';

export default class AggregatorDao {
  private readonly logger = new Logger(AggregatorDao.name);

  async bootstrap(): Promise<void> {
    const logger = [...(process.env.LOG_LEVELS.split(',') as LogLevel[])];
    const app = await NestFactory.createMicroservice(AggregatorDaoModule, {
      transport: Transport.TCP,
      logger,
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen(() =>
      this.logger.log('Aggregator DAO Microservice is listening...'),
    );

    app.get(AggregatorDaoService).aggregate();
  }
}
