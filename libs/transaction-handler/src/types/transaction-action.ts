import {
  NearTransactionAction,
  NearTransactionReceipt,
} from '@sputnik-v2/near-api/types';
import { Receipt, ReceiptAction } from '@sputnik-v2/near-indexer/entities';
import { getBlockTimestamp } from '@sputnik-v2/utils';

export type TransactionAction = {
  receiverId: string;
  signerId: string;
  transactionHash: string;
  methodName?: string;
  args: any;
  deposit: string;
  timestamp: number;
};

export function castNearTransactionAction(
  transactionHash: string,
  receipt: NearTransactionReceipt,
  action: NearTransactionAction,
  timestamp = getBlockTimestamp(),
): TransactionAction {
  return {
    transactionHash,
    receiverId: receipt.receiver_id,
    signerId: receipt.predecessor_id,
    methodName: action.FunctionCall?.methodName,
    args: action.FunctionCall?.args,
    deposit: action.Transfer?.deposit || action.FunctionCall?.deposit,
    timestamp,
  };
}

export function castNearIndexerReceiptAction(
  receipt: Receipt,
  ac: ReceiptAction,
): TransactionAction {
  return {
    receiverId: ac.receiptReceiverAccountId,
    signerId: ac.receiptPredecessorAccountId,
    transactionHash: receipt.originatedFromTransaction.transactionHash,
    methodName: ac?.args?.method_name as string,
    args: ac?.args?.args_json,
    deposit: (ac?.args?.deposit as string) || '0',
    timestamp: receipt.originatedFromTransaction.blockTimestamp,
  };
}
