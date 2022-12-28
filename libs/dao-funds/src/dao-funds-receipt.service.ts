import { Injectable } from '@nestjs/common';
import { DaoFundsReceiptModel } from '@sputnik-v2/dao-funds/models';
import {
  DynamodbService,
  DynamoEntityType,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import { DaoFundsReceiptDto } from './dto';

@Injectable()
export class DaoFundsReceiptService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(
    dto: DaoFundsReceiptDto,
  ): Promise<PartialEntity<DaoFundsReceiptModel>> {
    return this.dynamoDbService.saveItemByType<DaoFundsReceiptModel>(
      dto.daoId,
      DynamoEntityType.DaoFundsReceipt,
      `${dto.createTimestamp}-${dto.receiptId}`,
      {
        daoId: dto.daoId,
        receiptId: dto.receiptId,
        indexInReceipt: dto.indexInReceipt,
        predecessorId: dto.predecessorId,
        receiverId: dto.receiverId,
        amount: dto.amount,
        transactionHash: dto.transactionHash,
        createTimestamp: dto.createTimestamp,
      },
    );
  }
}
