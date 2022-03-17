import { Injectable, Logger } from '@nestjs/common';
import { NearApiService, NearTransactionStatus } from '@sputnik-v2/near-api';
import { AccountChange, Transaction } from '@sputnik-v2/near-indexer';
import { sleep } from '@sputnik-v2/utils';

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
    const txStatus = await this.getTxStatus(transactionHash, accountId);
    return this.getActionsByTxStatus(transactionHash, txStatus);
  }

  async getActionsByNearIndexerAccountChanges(
    accountChanges: AccountChange[],
  ): Promise<TransactionActionsResponse> {
    let transactions = [];
    let actions = [];

    for (const accountChange of accountChanges) {
      try {
        this.logger.log(
          `Received transaction: ${accountChange.causedByTransactionHash}`,
        );
        const res = await this.getActionsByAccountChange(accountChange);
        transactions = transactions.concat(res.transaction);
        actions = actions.concat(res.actions);
      } catch (error) {
        this.logger.error(
          `Failed to get transaction action ${accountChange.causedByTransactionHash} with error: ${error}`,
        );
      }
    }

    return {
      transactions,
      actions,
    };
  }

  private async getActionsByAccountChange(accountChange) {
    const originatedFromTransaction =
      accountChange.causedByReceipt.originatedFromTransaction;

    if (
      !originatedFromTransaction.transactionAction ||
      !accountChange.causedByReceipt.receiptActions ||
      this.isActFunctionCall(originatedFromTransaction)
    ) {
      const txStatus = await this.getTxStatus(
        originatedFromTransaction.transactionHash,
        originatedFromTransaction.signerAccountId,
      );
      return {
        transaction: {
          ...originatedFromTransaction,
          transactionAction: castTransactionActionEntity(txStatus),
        },
        actions: this.getActionsByTxStatus(
          originatedFromTransaction.transactionHash,
          txStatus,
        ),
      };
    }

    return {
      transaction: originatedFromTransaction,
      actions: accountChange.causedByReceipt.receiptActions.map((action) =>
        castNearIndexerReceiptAction(accountChange.causedByReceipt, action),
      ),
    };
  }

  private async getTxStatus(
    transactionHash: string,
    accountId: string,
  ): Promise<NearTransactionStatus> {
    let txStatus;

    try {
      txStatus = await this.nearApiService.getTxStatus(
        transactionHash,
        accountId,
      );
    } catch (error) {
      // Wait 3 seconds before retry
      await sleep(3000);
      txStatus = await this.nearApiService.getTxStatus(
        transactionHash,
        accountId,
      );
    }

    return txStatus;
  }

  private getActionsByTxStatus(
    transactionHash: string,
    txStatus: NearTransactionStatus,
  ): TransactionAction[] {
    return txStatus.receipts
      .map((receipt) =>
        receipt.receipt.Action.actions.map((action) =>
          castNearTransactionAction(transactionHash, receipt, action),
        ),
      )
      .flat();
  }

  private isActFunctionCall(transaction: Transaction): boolean {
    return (
      transaction.transactionAction?.args?.method_name === 'act_proposal' &&
      transaction.transactionAction?.actionKind === 'FUNCTION_CALL'
    );
  }
}
