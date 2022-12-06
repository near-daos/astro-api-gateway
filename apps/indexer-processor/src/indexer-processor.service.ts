import { Injectable, Logger } from '@nestjs/common';
import {
  TransactionActionHandlerService,
  TransactionHandlerService,
  TransactionHandlerStatus,
} from '@sputnik-v2/transaction-handler';
import { INDEXER_PROCESSOR_HANDLER_STATE_ID } from '@sputnik-v2/common';
import { CacheService } from '@sputnik-v2/cache';

import { RedisService } from './redis/redis.service';
import {
  castTransactionAction,
  mapReceiptEntryActionArgs,
  ReceiptEntry,
} from './types/receipt-entry';
import { IndexerProcessorErrorHandlerService } from './indexer-processor-error-handler.service';

@Injectable()
export class IndexerProcessorService {
  private readonly logger = new Logger(IndexerProcessorService.name);
  private readonly STREAM_RECEIPTS = 'receipts';

  constructor(
    private readonly redisService: RedisService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly transactionActionHandlerService: TransactionActionHandlerService,
    private readonly errorHandlerService: IndexerProcessorErrorHandlerService,
    private readonly cacheService: CacheService,
  ) {
    this.init();
  }

  async init() {
    this.errorHandlerService.resolveErrorsBackOff();
    await this.redisService.handleStream<ReceiptEntry>(
      this.STREAM_RECEIPTS,
      this.handleReceipt.bind(this),
    );
  }

  async handleReceipt(receipt: ReceiptEntry): Promise<boolean> {
    await this.transactionHandlerService.saveState(
      INDEXER_PROCESSOR_HANDLER_STATE_ID,
      TransactionHandlerStatus.InProgress,
      {
        includedInBlockHash: receipt.included_in_block_hash,
        blockTimestamp: receipt.included_in_block_timestamp,
      },
    );

    for (let i = 0; i < receipt.action?.actions.length; i++) {
      try {
        this.logger.log(`Handling receipt ${receipt.receipt_id} action ${i}`);
        await this.transactionActionHandlerService.handleTransactionAction(
          castTransactionAction(receipt, receipt.action.actions[i]),
        );
        this.logger.log(
          `Receipt ${receipt.receipt_id} action ${i} successfully handled`,
        );
      } catch (error) {
        await this.errorHandlerService.handleNewError(receipt, i, error);
        await this.transactionHandlerService.saveState(
          INDEXER_PROCESSOR_HANDLER_STATE_ID,
          TransactionHandlerStatus.Failed,
        );
        this.logger.error(
          `Failed to handle receipt ${receipt.receipt_id} action ${i}: ${error} (${error.stack}). Skip receipt.`,
        );
        return false;
      }
    }

    await this.transactionHandlerService.saveState(
      INDEXER_PROCESSOR_HANDLER_STATE_ID,
      TransactionHandlerStatus.Success,
    );
    await this.cacheService.clearCache();
    return true;
  }
}
