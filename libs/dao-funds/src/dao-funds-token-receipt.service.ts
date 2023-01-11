import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import {
  DynamodbService,
  DynamoEntityType,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import { DynamoPaginationDto } from '@sputnik-v2/dynamodb/dto';
import { parseBlockTimestamp, patchDailyBalance } from '@sputnik-v2/utils';
import { Retryable } from 'typescript-retry-decorator';
import { DailyBalanceEntryDto, DaoFundsTokenReceiptDto } from './dto';
import { DaoFundsTokenReceiptModel } from './models';

@Injectable()
export class DaoFundsTokenReceiptService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  castDtoToModel(dto: DaoFundsTokenReceiptDto): DaoFundsTokenReceiptModel {
    return {
      partitionId: dto.daoId,
      entityId: `${DynamoEntityType.DaoFundsTokenReceipt}:${dto.tokenId}-${dto.createTimestamp}-${dto.receiptId}-${dto.indexInReceipt}`,
      entityType: DynamoEntityType.DaoFundsTokenReceipt,
      daoId: dto.daoId,
      receiptId: dto.receiptId,
      indexInReceipt: dto.indexInReceipt,
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      tokenId: dto.tokenId,
      kind: dto.kind,
      amount: dto.amount,
      deposit: dto.deposit,
      methodName: dto.methodName,
      args: dto.args,
      transactionHash: dto.transactionHash,
      createTimestamp: dto.createTimestamp,
      isArchived: dto.isArchived,
    };
  }

  castModelToModel(
    model: PartialEntity<DaoFundsTokenReceiptModel>,
  ): DaoFundsTokenReceiptDto {
    return {
      daoId: model.daoId,
      receiptId: model.receiptId,
      indexInReceipt: model.indexInReceipt,
      senderId: model.senderId,
      receiverId: model.receiverId,
      tokenId: model.tokenId,
      kind: model.kind,
      amount: model.amount,
      deposit: model.deposit,
      methodName: model.methodName,
      args: model.args,
      transactionHash: model.transactionHash,
      createTimestamp: model.createTimestamp,
      isArchived: model.isArchived,
    };
  }

  async save(dto: DaoFundsTokenReceiptDto) {
    return this.dynamoDbService.saveItem<DaoFundsTokenReceiptModel>(
      this.castDtoToModel(dto),
    );
  }

  @Retryable({
    maxAttempts: 5,
    backOff: 3000,
  })
  async batchPut(dtos: DaoFundsTokenReceiptDto[]) {
    return this.dynamoDbService.batchPut<DaoFundsTokenReceiptModel>(
      dtos.map((dto) => this.castDtoToModel(dto)),
    );
  }

  async getByDaoIdAndTokenId(
    daoId: string,
    tokenId: string,
    pagination: DynamoPaginationDto,
  ) {
    const { limit = 100, nextToken } = pagination;

    const paginated =
      await this.dynamoDbService.paginateItemsByType<DaoFundsTokenReceiptModel>(
        daoId,
        DynamoEntityType.DaoFundsTokenReceipt,
        {},
        limit,
        nextToken,
        `${tokenId}-`,
      );

    return {
      ...paginated,
      data: paginated.data.map((item) => this.castModelToModel(item)),
    };
  }

  async getDailyTokenBalanceByDaoId(
    daoId: string,
    tokenId: string,
  ): Promise<DailyBalanceEntryDto[]> {
    let receipts: PartialEntity<DaoFundsTokenReceiptModel>[] = [];

    for await (const chunk of this.dynamoDbService.paginateAllItemsByType<DaoFundsTokenReceiptModel>(
      daoId,
      DynamoEntityType.DaoFundsTokenReceipt as DynamoEntityType,
      {},
      `${tokenId}-`,
    )) {
      receipts = receipts.concat(chunk);
    }

    receipts = receipts.sort(
      (a, b) =>
        parseBlockTimestamp(a.createTimestamp) -
        parseBlockTimestamp(b.createTimestamp),
    );

    let balance = 0n;

    const dailyBalance = receipts.reduce((values, receipt) => {
      const timestamp = DateTime.fromMillis(
        parseBlockTimestamp(receipt.createTimestamp),
      )
        .startOf('day')
        .toMillis();
      balance = values[timestamp] = balance + BigInt(receipt.amount);
      return values;
    }, {});

    patchDailyBalance(dailyBalance);

    return Object.entries(dailyBalance).map(([timestamp, value]) => ({
      timestamp: Number(timestamp),
      value: String(value),
    }));
  }
}
