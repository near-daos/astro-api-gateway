import { Provider } from 'near-api-js/lib/providers';
import { NearTransactionStatus } from './near-transaction-status';

export abstract class NearProvider extends Provider {
  abstract sendJsonRpc<T>(method: string, params: unknown): Promise<T>;
  abstract txStatusReceipts(
    txHash: Uint8Array | string,
    accountId: string,
  ): Promise<NearTransactionStatus>;
}
