import { Injectable } from '@nestjs/common';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  HandledReceiptActionModel,
  mapTransactionActionToHandledReceiptActionModel,
} from '@sputnik-v2/dynamodb/models/handled-receipt-action.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import {
  ContractHandlerResult,
  TransactionAction,
} from '@sputnik-v2/transaction-handler';

@Injectable()
export class HandledReceiptActionDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(action: TransactionAction, results: ContractHandlerResult[]) {
    await this.dynamoDbService.saveItem<HandledReceiptActionModel>(
      mapTransactionActionToHandledReceiptActionModel(action, results),
    );
  }

  async check(action: TransactionAction) {
    return this.dynamoDbService.getItemByType<HandledReceiptActionModel>(
      action.transactionHash,
      DynamoEntityType.HandledReceiptAction,
      `${action.receiptId}-${action.indexInReceipt}`,
    );
  }
}
