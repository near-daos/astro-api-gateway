import {
  NearTransactionStatus,
  NearTransactionAction,
} from '@sputnik-v2/near-api/types';
import { Transaction } from '@sputnik-v2/near-indexer/entities';
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
  txStatus: NearTransactionStatus,
  action: NearTransactionAction,
  timestamp = getBlockTimestamp(),
): TransactionAction {
  return {
    receiverId: txStatus.transaction.receiver_id,
    signerId: txStatus.transaction.signer_id,
    transactionHash: txStatus.transaction.hash,
    methodName: action.FunctionCall?.methodName,
    args: action.FunctionCall?.args,
    deposit: action.Transfer?.deposit || action.FunctionCall?.deposit,
    timestamp,
  };
}

export function castNearIndexerTransactionAction(
  tx: Transaction,
): TransactionAction {
  return {
    receiverId: tx.receiverAccountId,
    signerId: tx.signerAccountId,
    transactionHash: tx.transactionHash,
    methodName: tx.transactionAction?.args?.method_name as string,
    args: tx.transactionAction?.args?.args_json,
    deposit: (tx.transactionAction?.args?.deposit as string) || '0',
    timestamp: tx.blockTimestamp,
  };
}
