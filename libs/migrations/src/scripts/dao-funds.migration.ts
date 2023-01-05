import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NearConfig } from '@sputnik-v2/config/near-config';
import {
  DaoFundsReceiptService,
  DaoFundsTokenReceiptService,
} from '@sputnik-v2/dao-funds';
import { DynamodbService } from '@sputnik-v2/dynamodb';
import { NearIndexerService } from '@sputnik-v2/near-indexer';
import { castNearIndexerReceiptActionKind } from '@sputnik-v2/transaction-handler';

import { Migration } from '..';

@Injectable()
export class DaoFundsMigration implements Migration {
  private readonly logger = new Logger(DaoFundsMigration.name);
  private readonly contractName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly dynamodbService: DynamodbService,
    private readonly nearIndexerService: NearIndexerService,
    private readonly daoFundsReceiptService: DaoFundsReceiptService,
    private readonly daoFundsTokenReceiptService: DaoFundsTokenReceiptService,
  ) {
    this.contractName =
      this.configService.getOrThrow<NearConfig>('near').contractName;
  }

  async migrate(): Promise<void> {
    this.logger.log(`Starting migration...`);

    const accounts = await this.nearIndexerService.findAccountsByContractName(
      this.contractName,
    );
    const daoIds = accounts.map(({ accountId }) => accountId);

    for (const [index, daoId] of daoIds.entries()) {
      this.logger.log(
        `Migrating DAO funds receipts for ${daoId} (${index + 1}/${
          daoIds.length
        })...`,
      );

      await this.migrateDaoFundsReceipts(daoId);
      await this.migrateDaoFundsTokenReceipts(daoId);
    }

    this.logger.log(`Migration finished.`);
  }

  private async migrateDaoFundsReceipts(daoId: string) {
    const receiptActions =
      await this.nearIndexerService.receiptActionsByAccount(daoId);

    if (!receiptActions.length) {
      return;
    }

    const dtos = receiptActions.map((receiptAction) => {
      const daoId = this.isDaoContract(
        receiptAction.receiptPredecessorAccountId,
      )
        ? receiptAction.receiptPredecessorAccountId
        : receiptAction.receiptReceiverAccountId;

      const { deposit, method_name, args_json } = receiptAction.args as {
        deposit: string;
        method_name?: string;
        args_json?: Record<string, any>;
      };

      return {
        daoId,
        receiptId: receiptAction.receiptId,
        indexInReceipt: receiptAction.indexInActionReceipt,
        predecessorId: receiptAction.receiptPredecessorAccountId,
        receiverId: receiptAction.receiptReceiverAccountId,
        kind: castNearIndexerReceiptActionKind(receiptAction.actionKind),
        deposit: deposit,
        methodName: method_name,
        args: args_json,
        transactionHash: receiptAction.receipt.originatedFromTransactionHash,
        createTimestamp: receiptAction.receipt.includedInBlockTimestamp,
      };
    });

    const count = await this.daoFundsReceiptService.batchPut(dtos);

    this.logger.log(`Migrated receipts: ${count}/${receiptActions.length}`);
  }

  private async migrateDaoFundsTokenReceipts(daoId: string) {
    const receiptActions =
      await this.nearIndexerService.tokenReceiptActionsByAccount(daoId);

    if (!receiptActions.length) {
      return;
    }

    const dtos = receiptActions.map((receiptAction) => {
      const { method_name, args_json } = receiptAction.args as {
        method_name: string;
        args_json: {
          account_id?: string;
          receiver_id?: string;
          amount: string;
        };
      };

      const receiverId = args_json.receiver_id ?? args_json.account_id;
      const daoId = this.isDaoContract(
        receiptAction.receiptPredecessorAccountId,
      )
        ? receiptAction.receiptPredecessorAccountId
        : receiverId;

      return {
        daoId,
        receiptId: receiptAction.receiptId,
        indexInReceipt: receiptAction.indexInActionReceipt,
        tokenId: receiptAction.receiptReceiverAccountId,
        senderId: receiptAction.receiptPredecessorAccountId,
        receiverId,
        kind: castNearIndexerReceiptActionKind(receiptAction.actionKind),
        amount: args_json.amount,
        methodName: method_name,
        args: args_json,
        transactionHash: receiptAction.receipt.originatedFromTransactionHash,
        createTimestamp: receiptAction.receipt.includedInBlockTimestamp,
      };
    });

    const count = await this.daoFundsTokenReceiptService.batchPut(dtos);

    this.logger.log(
      `Migrated token receipts: ${count}/${receiptActions.length}`,
    );
  }

  private isDaoContract(receiverId: string): boolean {
    return receiverId.endsWith(`.${this.contractName}`);
  }
}
