import { Injectable } from '@nestjs/common';
import { DaoFundsTokenReceiptModel } from '@sputnik-v2/dao-funds/models';
import {
  DynamodbService,
  DynamoEntityType,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import { DaoFundsTokenReceiptDto } from './dto';

@Injectable()
export class DaoFundsTokenReceiptService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(
    dto: DaoFundsTokenReceiptDto,
  ): Promise<PartialEntity<DaoFundsTokenReceiptModel>> {
    return this.dynamoDbService.saveItemByType<DaoFundsTokenReceiptModel>(
      dto.daoId,
      DynamoEntityType.DaoFundsTokenReceipt,
      `${dto.tokenId}-${dto.createTimestamp}-${dto.receiptId}`,
      {
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
      },
    );
  }
}
