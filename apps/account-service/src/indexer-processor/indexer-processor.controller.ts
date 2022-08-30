import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';

import { REDIS_STREAM_NAME } from '../common/constants';
import { IndexerProcessorService } from './indexer-processor.service';

@Controller()
export class IndexerProcessorController {
  private readonly logger = new Logger(IndexerProcessorController.name);

  constructor(
    private readonly indexerProcessorService: IndexerProcessorService,
  ) {}

  @EventPattern(REDIS_STREAM_NAME, Transport.REDIS)
  async onEvent(data: any) {
    console.log(data);
  }
}
