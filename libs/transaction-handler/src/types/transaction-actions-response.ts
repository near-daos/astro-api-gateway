import { Transaction } from '@sputnik-v2/near-indexer';
import { TransactionAction } from './transaction-action';

export type TransactionActionsResponse = {
  transactions: Transaction[];
  actions: TransactionAction[];
};
