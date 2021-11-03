import { NearTransactionStatus } from 'src/near-api/types/near-transaction-status';
import { NearTransactionAction } from 'src/near-api/types/near-transaction-action';
import { getBlockTimestamp } from '../../utils';

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
