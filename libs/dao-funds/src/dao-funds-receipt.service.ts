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
import { DailyBalanceEntryDto, DaoFundsReceiptDto } from './dto';
import { DaoFundsReceiptModel } from './models';

@Injectable()
export class DaoFundsReceiptService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  castDtoToModel(dto: DaoFundsReceiptDto): DaoFundsReceiptModel {
    return {
      partitionId: dto.daoId,
      entityId: `${DynamoEntityType.DaoFundsReceipt}:${dto.createTimestamp}-${dto.receiptId}-${dto.indexInReceipt}`,
      entityType: DynamoEntityType.DaoFundsReceipt,
      daoId: dto.daoId,
      receiptId: dto.receiptId,
      indexInReceipt: dto.indexInReceipt,
      predecessorId: dto.predecessorId,
      receiverId: dto.receiverId,
      kind: dto.kind,
      deposit: dto.deposit,
      methodName: dto.methodName,
      args: dto.args,
      transactionHash: dto.transactionHash,
      createTimestamp: dto.createTimestamp,
      isArchived: dto.isArchived,
    };
  }

  castModelToDto(
    model: PartialEntity<DaoFundsReceiptModel>,
  ): DaoFundsReceiptDto {
    return {
      daoId: model.daoId,
      receiptId: model.receiptId,
      indexInReceipt: model.indexInReceipt,
      predecessorId: model.predecessorId,
      receiverId: model.receiverId,
      kind: model.kind,
      deposit: model.deposit,
      methodName: model.methodName,
      args: model.args,
      transactionHash: model.transactionHash,
      createTimestamp: model.createTimestamp,
      isArchived: model.isArchived,
    };
  }

  async save(dto: DaoFundsReceiptDto) {
    return this.dynamoDbService.saveItem<DaoFundsReceiptModel>(
      this.castDtoToModel(dto),
    );
  }

  @Retryable({
    maxAttempts: 5,
    backOff: 3000,
  })
  async batchPut(dtos: DaoFundsReceiptDto[]) {
    return this.dynamoDbService.batchPut<DaoFundsReceiptModel>(
      dtos.map((dto) => this.castDtoToModel(dto)),
    );
  }

  async getByDaoId(daoId: string, pagination: DynamoPaginationDto) {
    const { limit = 100, nextToken } = pagination;

    const paginated =
      await this.dynamoDbService.paginateItemsByType<DaoFundsReceiptModel>(
        daoId,
        DynamoEntityType.DaoFundsReceipt,
        {},
        limit,
        nextToken,
      );

    return {
      ...paginated,
      data: paginated.data.map((item) => this.castModelToDto(item)),
    };
  }

  async getDailyBalanceByDaoId(daoId: string): Promise<DailyBalanceEntryDto[]> {
    let receipts: PartialEntity<DaoFundsReceiptModel>[] = [];

    for await (const chunk of this.dynamoDbService.paginateAllItemsByType<DaoFundsReceiptModel>(
      daoId,
      DynamoEntityType.DaoFundsReceipt,
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
      balance = values[timestamp] = balance + BigInt(receipt.deposit);
      return values;
    }, {});

    patchDailyBalance(dailyBalance);

    return Object.entries(dailyBalance).map(([timestamp, value]) => ({
      timestamp: Number(timestamp),
      value: String(value),
    }));
  }
}
