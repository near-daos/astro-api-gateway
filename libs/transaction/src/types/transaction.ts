import {
  ActionKind,
  ExecutionOutcomeStatus,
  Transaction,
  TransactionAction,
} from '@sputnik-v2/near-indexer';

function castEmptyTransactionAction(
  transactionHash: string,
): TransactionAction {
  return Object.assign(new TransactionAction(), {
    transactionHash,
    indexInTransaction: 0,
    actionKind: ActionKind.FunctionCall,
    args: null,
  });
}

export function castEmptyTransaction(
  transactionHash: string,
  accountId: string,
): Transaction {
  return {
    transactionHash,
    signerAccountId: accountId,
    includedInBlockHash: '',
    includedInChunkHash: '',
    indexInChunk: 0,
    receiverAccountId: '',
    signerPublicKey: '',
    signature: '',
    nonce: 0,
    status: ExecutionOutcomeStatus.Unknown,
    convertedIntoReceiptId: '',
    receiptConversionGasBurnt: '',
    receiptConversionTokensBurnt: '',
    blockTimestamp: '0',
    transactionAction: castEmptyTransactionAction(transactionHash),
    receipts: [],
  };
}
