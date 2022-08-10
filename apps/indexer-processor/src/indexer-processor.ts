import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';

import { IndexerProcessorModule } from './indexer-processor.module';

export default class IndexerProcessor {
  private readonly logger = new Logger(IndexerProcessor.name);

  async bootstrap(): Promise<void> {
    const app = await NestFactory.createMicroservice(IndexerProcessorModule, {
      bufferLogs: true,
    });

    app.useLogger(app.get(PinoLogger));

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.listen();

    this.logger.log('Indexer Processor Microservice is listening...');
  }
}
