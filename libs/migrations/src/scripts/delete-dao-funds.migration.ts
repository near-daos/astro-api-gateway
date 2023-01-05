import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NearConfig } from '@sputnik-v2/config/near-config';
import {
  DaoFundsReceiptModel,
  DaoFundsTokenReceiptModel,
} from '@sputnik-v2/dao-funds';
import { DynamodbService, DynamoEntityType } from '@sputnik-v2/dynamodb';
import { NearIndexerService } from '@sputnik-v2/near-indexer';
import PromisePool from '@supercharge/promise-pool';

import { Migration } from '..';

@Injectable()
export class DeleteDaoFundsMigration implements Migration {
  private readonly logger = new Logger(DeleteDaoFundsMigration.name);
  private readonly contractName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly nearIndexerService: NearIndexerService,
    private readonly dynamoDbService: DynamodbService,
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

    await this.clearReceipts(daoIds);

    this.logger.log(`Migration finished.`);
  }

  private async clearReceipts(daoIds: string[]) {
    await PromisePool.for(daoIds)
      .withConcurrency(5)
      .handleError((err) => {
        this.logger.warn(`Clear receipts error: ${err} (${err.stack})`);
      })
      .process(async (daoId) => {
        await this.deleteReceipts(daoId);
        await this.deleteTokenReceipts(daoId);
      });
  }

  private async deleteReceipts(daoId: string) {
    for await (const receipts of this.dynamoDbService.paginateItemsByType<DaoFundsReceiptModel>(
      daoId,
      DynamoEntityType.DaoFundsReceipt,
    )) {
      const count = await this.dynamoDbService.batchDelete(receipts);

      if (count) {
        this.logger.log(`Deleted receipts for ${daoId}: ${count}`);
      }
    }
  }

  private async deleteTokenReceipts(daoId: string) {
    for await (const tokenReceipts of this.dynamoDbService.paginateItemsByType<DaoFundsTokenReceiptModel>(
      daoId,
      DynamoEntityType.DaoFundsTokenReceipt,
    )) {
      const count = await this.dynamoDbService.batchDelete(tokenReceipts);

      if (count) {
        this.logger.log(`Deleted token receipts for ${daoId}: ${count}`);
      }
    }
  }
}
