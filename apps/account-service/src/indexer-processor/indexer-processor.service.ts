import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class IndexerProcessorService {
  private readonly logger = new Logger(IndexerProcessorService.name);

  constructor() {}
}
