import { Module } from '@nestjs/common';

import { IndexerProcessorController } from './indexer-processor.controller';
import { IndexerProcessorService } from './indexer-processor.service';

@Module({
  controllers: [IndexerProcessorController],
  providers: [IndexerProcessorService],
  exports: [IndexerProcessorService],
})
export class IndexerProcessorModule {}
