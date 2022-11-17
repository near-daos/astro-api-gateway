import { Injectable } from '@nestjs/common';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  HandledReceiptActionModel,
  mapTransactionActionToHandledReceiptActionModel,
} from '@sputnik-v2/dynamodb/models/handled-receipt-action.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import { TransactionAction } from '@sputnik-v2/transaction-handler';

@Injectable()
export class HandledReceiptActionDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(action: TransactionAction) {
    await this.dynamoDbService.saveItem<HandledReceiptActionModel>(
      mapTransactionActionToHandledReceiptActionModel(action),
    );
  }

  async check(action: TransactionAction) {
    return this.dynamoDbService.getItemByType(
      action.transactionHash,
      DynamoEntityType.HandledReceiptAction,
      `${action.receiptId}-${action.indexInReceipt}`,
    );
  }
}
