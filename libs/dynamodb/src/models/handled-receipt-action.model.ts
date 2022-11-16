import { TransactionAction } from '@sputnik-v2/transaction-handler';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseEntity, DynamoEntityType } from '../types';

export class HandledReceiptActionModel extends BaseEntity {
  processingTimestamp: number;
}

export function mapTransactionActionToHandledReceiptActionModel(
  action: TransactionAction,
): HandledReceiptActionModel {
  return {
    partitionId: action.transactionHash,
    entityId: buildEntityId(
      DynamoEntityType.HandledReceiptAction,
      `${action.receiptId}-${action.indexInReceipt}`,
    ),
    entityType: DynamoEntityType.HandledReceiptAction,
    processingTimestamp: Date.now(),
  };
}
