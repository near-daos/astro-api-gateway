import { Injectable, Logger } from '@nestjs/common';
import { NearApiService } from '@sputnik-v2/near-api';
import {
  TransactionActionHandlerService,
  TransactionHandlerService,
  TransactionHandlerStatus,
} from '@sputnik-v2/transaction-handler';
import { INDEXER_PROCESSOR_HANDLER_STATE_ID } from '@sputnik-v2/common';
import { CacheService } from '@sputnik-v2/cache';

import { RedisService } from './redis/redis.service';
import {
  ActionReceiptAction,
  castTransactionAction,
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
    private readonly nearApiService: NearApiService,
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
        const transactionAction = await this.getTransactionAction(
          receipt,
          receipt.action.actions[i],
        );
        await this.transactionActionHandlerService.handleTransactionAction(
          transactionAction,
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

  private async getTransactionAction(
    receipt: ReceiptEntry,
    action: ActionReceiptAction,
  ) {
    const txStatus = await this.nearApiService.getTxStatusRetry(
      receipt.originated_from_transaction_hash,
      receipt.predecessor_account_id,
    );

    const outcome = txStatus.receipts_outcome.find(
      (outcome) => outcome.id === receipt.receipt_id,
    );

    if (!outcome) {
      throw new Error(
        `Unable to fund outcome for receipt ID: ${receipt.receipt_id}`,
      );
    }

    return castTransactionAction(txStatus, receipt, outcome, action);
  }
}
