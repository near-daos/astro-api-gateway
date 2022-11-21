import { castTransactionStatus } from '@sputnik-v2/near-api';
import { ExecutionOutcomeWithIdView } from 'near-api-js/lib/providers/provider';

export function castTransactionReceiptOutcome(
  outcome: ExecutionOutcomeWithIdView,
) {
  return {
    ...outcome,
    outcome: {
      ...outcome.outcome,
      status: castTransactionStatus(outcome.outcome.status),
    },
  };
}
