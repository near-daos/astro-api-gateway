import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { ExecutionOutcomeWithIdView } from 'near-api-js/lib/providers/provider';

import { NearTransaction } from './near-transaction';
import { NearTransactionReceipt } from './near-transaction-receipt';

export interface NearTransactionStatus extends FinalExecutionOutcome {
  transaction: NearTransaction;
  receipts: NearTransactionReceipt[];
  receipts_outcome: ExecutionOutcomeWithIdView[];
}
