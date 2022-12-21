import { NearTransactionStatus } from '@sputnik-v2/near-api';
import { ActionKind } from '@sputnik-v2/near-indexer';
import { TransactionAction } from '@sputnik-v2/transaction-handler';
import {
  ExecutionOutcomeWithIdView,
  ExecutionStatus,
} from 'near-api-js/lib/providers/provider';

export class ActionReceiptAction {
  receipt_id: string;
  index_in_action_receipt: number;
  action_kind: ActionKind;
  args: Record<string, unknown>;
  receipt_predecessor_account_id: string;
  receipt_receiver_account_id: string;
  receipt_included_in_block_timestamp: bigint;
}

export class ActionReceiptEntry {
  receipt_id: string;
  signer_account_id: string;
  signer_public_key: string;
  gas_price: bigint;
  actions: ActionReceiptAction[];
}

export class ReceiptEntry {
  receipt_id: string;
  included_in_block_hash: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  included_in_block_timestamp: string;
  predecessor_account_id: string;
  receiver_account_id: string;
  receipt_kind: 'ACTION' | 'DATA';
  originated_from_transaction_hash: string;
  action: ActionReceiptEntry | null;
}

export function mapReceiptEntryActionArgs(receipt: ReceiptEntry): ReceiptEntry {
  return {
    ...receipt,
    action: {
      ...receipt.action,
      actions: receipt.action.actions.map((action) => ({
        ...action,
        args: {
          method_name: action.args?.method_name,
          deposit: action.args?.deposit,
          args_json: action.args?.args_json,
        },
      })),
    },
  };
}

export function castTransactionAction(
  txStatus: NearTransactionStatus,
  receipt: ReceiptEntry,
  outcome: ExecutionOutcomeWithIdView,
  action: ActionReceiptAction,
): TransactionAction {
  return {
    receiverId: action.receipt_receiver_account_id,
    signerId: action.receipt_predecessor_account_id,
    txSignerId: receipt.action.signer_account_id,
    predecessorId: action.receipt_predecessor_account_id,
    transactionHash: receipt.originated_from_transaction_hash,
    methodName: action?.args?.method_name as string,
    args: action?.args?.args_json,
    deposit: (action?.args?.deposit as string) || '0',
    timestamp: receipt.included_in_block_timestamp,
    receiptId: receipt.receipt_id,
    indexInReceipt: action.index_in_action_receipt,
    status: txStatus.status,
    receiptSuccessValue: (outcome.outcome.status as ExecutionStatus)
      ?.SuccessValue,
  };
}
