import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@sputnik-v2/cache';
import {
  ErrorStatus,
  ErrorTrackerService,
  ErrorType,
} from '@sputnik-v2/error-tracker';
import {
  TransactionActionHandlerService,
  TransactionHandlerService,
} from '@sputnik-v2/transaction-handler';
import { sleep } from '@sputnik-v2/utils';
import { backOff } from 'exponential-backoff';

import { IndexerProcessorCommonService } from './indexer-processor-common.service';

import { RedisService } from './redis/redis.service';
import { mapReceiptEntryActionArgs, ReceiptEntry } from './types/receipt-entry';

@Injectable()
export class IndexerProcessorErrorHandlerService {
  private readonly logger = new Logger(
    IndexerProcessorErrorHandlerService.name,
  );
  private readonly backOffOptions = {
    maxDelay: 86400000, // 24 hours
    numOfAttempts: 30,
    startingDelay: 20000, // 20 seconds
  };

  constructor(
    private readonly redisService: RedisService,
    private readonly transactionHandlerService: TransactionHandlerService,
    private readonly transactionActionHandlerService: TransactionActionHandlerService,
    private readonly errorTrackerService: ErrorTrackerService,
    private readonly cacheService: CacheService,
    private readonly commonService: IndexerProcessorCommonService,
  ) {}

  async handleNewError(
    receipt: ReceiptEntry,
    actionIndex: number,
    error: Error,
  ) {
    const errorId = `${receipt.receipt_id}-${actionIndex}`;
    await this.errorTrackerService.create({
      id: errorId,
      type: ErrorType.IndexerProcessor,
      timestamp: receipt.included_in_block_timestamp,
      reason: `${error} (${error.stack})`,
      metadata: {
        receipt: mapReceiptEntryActionArgs(receipt),
      },
    });
    this.resolveErrorBackOff(errorId);
  }

  async resolveErrorsBackOff() {
    const openErrorIds = await this.errorTrackerService.getOpenErrorsIds();

    for (const errorId of openErrorIds) {
      this.resolveErrorBackOff(errorId);
      // wait 3 seconds before next error resolving to avoid rpc 429 error
      await sleep(3000);
    }
  }

  resolveErrorBackOff(id: string) {
    backOff(async () => {
      return this.resolveError(id);
    }, this.backOffOptions);
  }

  async resolveError(id: string) {
    this.logger.log(`Resolving error ${id}`);
    const error = await this.errorTrackerService.getErrorById(id);
    const receipt: ReceiptEntry = error.metadata?.receipt;

    if (
      !error ||
      error.status === ErrorStatus.Resolved ||
      error.type !== ErrorType.IndexerProcessor ||
      !receipt
    ) {
      this.logger.log(`Resolving error ${id}: skipped`);
      return;
    }

    for (let i = 0; i < receipt.action?.actions.length; i++) {
      try {
        this.logger.log(
          `Resolving error ${id}: Handling receipt ${receipt.receipt_id} action ${i}`,
        );
        const transactionAction = await this.commonService.getTransactionAction(
          receipt,
          receipt.action.actions[i],
        );
        await this.transactionActionHandlerService.handleTransactionAction(
          transactionAction,
        );
        this.logger.log(
          `Resolving error ${id}: Receipt ${receipt.receipt_id} action ${i} successfully handled`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to resolve error ${error.id} - receipt ${receipt.receipt_id} action ${i}: ${err} (${err.stack}).`,
        );
        throw new Error(err);
      }
    }

    await this.errorTrackerService.setErrorStatus(id, ErrorStatus.Resolved);
    await this.cacheService.clearCache();
  }
}
