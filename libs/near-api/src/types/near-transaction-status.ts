import { FinalExecutionOutcome } from 'near-api-js/lib/providers';

import { NearTransactionReceipt } from './near-transaction-receipt';
import { NearTransaction } from './near-transaction';

export type NearTransactionStatus = {
  transaction: NearTransaction;
  receipts: NearTransactionReceipt[];
} & FinalExecutionOutcome;
