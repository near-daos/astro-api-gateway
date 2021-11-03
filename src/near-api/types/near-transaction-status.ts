import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { NearTransaction } from './near-transaction';

export type NearTransactionStatus = {
  transaction: NearTransaction;
} & FinalExecutionOutcome;
