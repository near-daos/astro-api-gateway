import { Injectable } from '@nestjs/common';
import {
  DynamodbService,
  DynamoEntityType,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import { TreasuryReceiptActionModel } from '@sputnik-v2/treasury/models';
import { TreasuryReceiptActionDto } from './dto';

@Injectable()
export class TreasuryReceiptActionService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(
    dto: TreasuryReceiptActionDto,
  ): Promise<PartialEntity<TreasuryReceiptActionModel>> {
    return this.dynamoDbService.saveItemByType<TreasuryReceiptActionModel>(
      dto.daoId,
      DynamoEntityType.TreasuryReceiptAction,
      dto.transactionHash,
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
