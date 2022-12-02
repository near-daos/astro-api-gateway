import { Injectable, Logger } from '@nestjs/common';
import {
  TransactionActionHandlerService,
  TransactionHandlerService,
  TransactionHandlerStatus,
} from '@sputnik-v2/transaction-handler';
import {
  ErrorStatus,
  ErrorTrackerService,
  ErrorType,
} from '@sputnik-v2/error-tracker';
import { INDEXER_PROCESSOR_HANDLER_STATE_ID } from '@sputnik-v2/common';
import { CacheService } from '@sputnik-v2/cache';

import { RedisService } from './redis/redis.service';
import { castTransactionAction, ReceiptEntry } from './types/receipt-entry';

@Injectable()
export class IndexerProcessorService {
  private readonly logger = new Logger(IndexerProcessorService.name);
  private readonly STREAM_RECEIPTS = 'receipts';

  constructor(
    private readonly redisService: RedisService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly transactionActionHandlerService: TransactionActionHandlerService,
    private readonly errorTrackerService: ErrorTrackerService,
    private readonly cacheService: CacheService,
  ) {
    this.init();
  }

  async init() {
    await this.resolveErrors();
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
        // Save error and stop handling receipt
        await this.errorTrackerService.create({
          id: `${receipt.receipt_id}-${i}`,
          type: ErrorType.IndexerProcessor,
          timestamp: receipt.included_in_block_timestamp,
          reason: `${error} (${error.stack})`,
          metadata: { receipt },
        });
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

  async resolveErrors() {
    const errors = await this.errorTrackerService.getOpenErrors(
      ErrorType.IndexerProcessor,
    );
    this.logger.log(`Found ${errors.length} errors to resolve`);

    for (const error of errors) {
      this.logger.log(`Resolving error ${error.id}`);
      await this.errorTrackerService.setErrorStatus(
        error.id,
        ErrorStatus.InProgress,
      );

      const success = await this.handleReceipt(error.metadata.receipt);
      if (success) {
        await this.errorTrackerService.setErrorStatus(
          error.id,
          ErrorStatus.Resolved,
        );
        this.logger.log(`Error ${error.id} resolved`);
      } else {
        await this.errorTrackerService.setErrorStatus(
          error.id,
          ErrorStatus.Open,
        );
        this.logger.error(`Failed to resolve error ${error.id}`);
      }
    }
  }
}
