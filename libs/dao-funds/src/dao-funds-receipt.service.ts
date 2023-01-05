import { Injectable } from '@nestjs/common';
import { DaoFundsReceiptModel } from '@sputnik-v2/dao-funds/models';
import { DynamodbService, DynamoEntityType } from '@sputnik-v2/dynamodb';
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
}
