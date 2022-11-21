import { Injectable, Logger } from '@nestjs/common';
import { NearApiService, NearTransactionStatus } from '@sputnik-v2/near-api';
import { Receipt, Transaction } from '@sputnik-v2/near-indexer';
import { Retryable } from 'typescript-retry-decorator';

import {
  castNearIndexerReceiptAction,
  castNearTransactionAction,
  castTransactionActionEntity,
  TransactionAction,
  TransactionActionsResponse,
} from './types';

@Injectable()
export class TransactionActionMapperService {
  private readonly logger = new Logger(TransactionActionMapperService.name);

  constructor(private readonly nearApiService: NearApiService) {}

  async getActionsByNearTransaction(
    transactionHash: string,
    accountId: string,
  ): Promise<TransactionAction[]> {
    const txStatus = await this.getTxStatusRetry(transactionHash, accountId);
    return this.getActionsByTxStatus(txStatus);
  }

  async getActionsByReceipts(
    receipts: Receipt[],
  ): Promise<TransactionActionsResponse> {
    const transactions = {};
    let actions = [];

    for (const receipt of receipts) {
      try {
        this.logger.log(
          `Received transaction: ${receipt.originatedFromTransactionHash}`,
        );
        const res = await this.getActionsByReceipt(receipt);
        transactions[res.transaction.transactionHash] = res.transaction;
        actions = actions.concat(res.actions);
      } catch (error) {
        this.logger.error(
          `Failed to get transaction action ${receipt.originatedFromTransactionHash} with error: ${error}`,
        );
      }
    }

    return {
      transactions: Object.values(transactions),
      actions,
    };
  }

  private async getActionsByReceipt(receipt: Receipt) {
    const originatedFromTransaction = receipt.originatedFromTransaction;
    if (
      !originatedFromTransaction.transactionAction ||
      !receipt.receiptActions ||
      this.isActFunctionCall(originatedFromTransaction)
    ) {
      const txStatus = await this.getTxStatusRetry(
        originatedFromTransaction.transactionHash,
        originatedFromTransaction.signerAccountId,
      );
      return {
        transaction: {
          ...originatedFromTransaction,
          transactionAction: castTransactionActionEntity(txStatus),
        },
        actions: this.getActionsByTxStatus(txStatus),
      };
    }

    return {
      transaction: originatedFromTransaction,
      actions: receipt.receiptActions.map((action) =>
        castNearIndexerReceiptAction(receipt, action),
      ),
    };
  }

  @Retryable({
    maxAttempts: 5,
    backOff: 1000,
  })
  private async getBlockRetry(blockHash: string) {
    return this.nearApiService.getBlock(blockHash);
  }

  @Retryable({
    maxAttempts: 5,
    backOff: 1000,
  })
  private async getTxStatusRetry(
    transactionHash: string,
    accountId: string,
  ): Promise<NearTransactionStatus> {
    return this.nearApiService.getTxStatus(transactionHash, accountId);
  }

  private async getActionsByTxStatus(
    txStatus: NearTransactionStatus,
  ): Promise<TransactionAction[]> {
    const blockHashes = [
      ...new Set(
        txStatus.receipts_outcome.map((outcome) => outcome.block_hash),
      ),
    ];

    const blocks = await Promise.all(
      blockHashes.map((hash) => this.getBlockRetry(hash)),
    );

    return txStatus.receipts
      .map((receipt) => {
        const outcome = txStatus.receipts_outcome.find(
          (outcome) => outcome.id === receipt.receipt_id,
        );

        if (!outcome) {
          throw new Error(
            `Unable to fund outcome for receipt ID: ${receipt.receipt_id}`,
          );
        }

        const block = blocks.find(
          (block) => block.header.hash === outcome.block_hash,
        );

        if (!block) {
          throw new Error(`Unable to find block for outcome ID: ${outcome.id}`);
        }

        return receipt.receipt.Action.actions.map((action, index) =>
          castNearTransactionAction(
            txStatus,
            block,
            receipt,
            outcome,
            action,
            index,
          ),
        );
      })
      .flat();
  }

  private isActFunctionCall(transaction: Transaction): boolean {
    return (
      transaction.transactionAction?.args?.method_name === 'act_proposal' &&
      transaction.transactionAction?.actionKind === 'FUNCTION_CALL'
    );
  }
}
