import { Injectable } from '@nestjs/common';
import { DaoFundsReceiptModel } from '@sputnik-v2/dao-funds/models';
import {
  DynamodbService,
  DynamoEntityType,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import { DynamoPaginationDto } from '@sputnik-v2/dynamodb/dto';
import { Retryable } from 'typescript-retry-decorator';
import { DaoFundsReceiptDto } from './dto';

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
}
