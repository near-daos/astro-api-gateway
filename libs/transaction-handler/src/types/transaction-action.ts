import {
  NearTransactionAction,
  NearTransactionReceipt,
  NearTransactionStatus,
} from '@sputnik-v2/near-api/types';
import {
  Receipt,
  ReceiptAction,
  TransactionAction as TransactionActionEntity,
} from '@sputnik-v2/near-indexer/entities';
import { ActionKind } from '@sputnik-v2/near-indexer';
import {
  BlockResult,
  ExecutionOutcomeWithIdView,
  ExecutionStatus,
} from 'near-api-js/lib/providers/provider';

export type TransactionAction = {
  receiverId: string;
  signerId: string;
  // added for backward compatibility with original signer id that can be a predecessor in some cases
  txSignerId?: string;
  predecessorId?: string;
  transactionHash: string;
  methodName?: string;
  args: any;
  deposit: string;
  timestamp: string; // nanoseconds
  receiptId?: string;
  indexInReceipt: number;
  status?: any;
  receiptSuccessValue?: string;
};

export function castNearTransactionAction(
  txStatus: NearTransactionStatus,
  block: BlockResult,
  receipt: NearTransactionReceipt,
  outcome: ExecutionOutcomeWithIdView,
  action: NearTransactionAction,
  index: number,
): TransactionAction {
  return {
    transactionHash: txStatus.transaction.hash,
    status: txStatus.status,
    receiverId: receipt.receiver_id,
    predecessorId: receipt.predecessor_id,
    signerId: receipt.predecessor_id,
    methodName: action.FunctionCall?.methodName,
    args: action.FunctionCall?.args,
    deposit: action.Transfer?.deposit || action.FunctionCall?.deposit,
    timestamp: block.header.timestamp_nanosec,
    receiptId: receipt.receipt_id,
    indexInReceipt: index,
    receiptSuccessValue: (outcome.outcome.status as ExecutionStatus)
      ?.SuccessValue,
  };
}

export function castNearIndexerReceiptAction(
  receipt: Receipt,
  ac: ReceiptAction,
): TransactionAction {
  return {
    receiverId: ac.receiptReceiverAccountId,
    signerId: ac.receiptPredecessorAccountId,
    txSignerId: receipt.originatedFromTransaction?.signerAccountId,
    predecessorId: ac.receiptPredecessorAccountId,
    transactionHash: receipt.originatedFromTransaction.transactionHash,
    methodName: ac?.args?.method_name as string,
    args: ac?.args?.args_json,
    deposit: (ac?.args?.deposit as string) || '0',
    timestamp: receipt.originatedFromTransaction.blockTimestamp,
    receiptId: receipt.receiptId,
    indexInReceipt: ac.indexInActionReceipt,
  };
}

export function castTransactionActionEntity(
  txStatus: NearTransactionStatus,
  actionIndex = 0,
): Partial<TransactionActionEntity> {
  const action = txStatus.transaction.actions[actionIndex];
  const actionKindKey = Object.keys(ActionKind).find((key) => action[key]);
  return {
    transactionHash: txStatus.transaction.hash,
    indexInTransaction: actionIndex,
    actionKind: ActionKind[actionKindKey],
  };
}
