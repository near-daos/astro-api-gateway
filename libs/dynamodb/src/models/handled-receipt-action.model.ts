import { DynamoEntityType } from '@sputnik-v2/dynamodb';
import { TransactionAction } from '@sputnik-v2/transaction-handler';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseEntity } from '../types/base-entity';

export class HandledReceiptActionModel extends BaseEntity {}

export function mapTransactionActionToHandledReceiptActionModel(
  action: TransactionAction,
): HandledReceiptActionModel {
  return {
    partitionId: action.transactionHash,
    entityId: buildEntityId(
      DynamoEntityType.HandledReceiptAction,
      String(action.indexInReceipt),
    ),
    entityType: DynamoEntityType.HandledReceiptAction,
  };
}
