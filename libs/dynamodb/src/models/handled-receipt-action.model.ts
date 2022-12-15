import {
  ContractHandlerResult,
  TransactionAction,
} from '@sputnik-v2/transaction-handler';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseEntity, DynamoEntityType } from '../types';

export class HandledReceiptActionModel extends BaseEntity {
  results: ContractHandlerResult[];
}

export function mapTransactionActionToHandledReceiptActionModel(
  action: TransactionAction,
  results: ContractHandlerResult[],
): HandledReceiptActionModel {
  return {
    partitionId: action.transactionHash,
    entityId: buildEntityId(
      DynamoEntityType.HandledReceiptAction,
      `${action.receiptId}-${action.indexInReceipt}`,
    ),
    entityType: DynamoEntityType.HandledReceiptAction,
    results,
  };
}
