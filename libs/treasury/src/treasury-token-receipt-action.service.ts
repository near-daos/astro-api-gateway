import { Injectable } from '@nestjs/common';
import {
  DynamodbService,
  DynamoEntityType,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import { TreasuryTokenReceiptActionModel } from '@sputnik-v2/treasury/models';
import { TreasuryTokenReceiptActionDto } from './dto';

@Injectable()
export class TreasuryTokenReceiptActionService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(
    dto: TreasuryTokenReceiptActionDto,
  ): Promise<PartialEntity<TreasuryTokenReceiptActionModel>> {
    return this.dynamoDbService.saveItemByType<TreasuryTokenReceiptActionModel>(
      dto.daoId,
      DynamoEntityType.TreasuryTokenReceiptAction,
      `${dto.tokenId}-${dto.transactionHash}`,
      {
        daoId: dto.daoId,
        receiptId: dto.receiptId,
        indexInReceipt: dto.indexInReceipt,
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        tokenId: dto.tokenId,
        amount: dto.amount,
        transactionHash: dto.transactionHash,
        createTimestamp: dto.createTimestamp,
      },
    );
  }
}
