import { NearTransactionAction } from './near-transaction-action';

export type NearTransaction = {
  hash: string;
  nonce: number;
  public_key: string;
  receiver_id: string;
  signature: string;
  signer_id: string;
  actions: NearTransactionAction[];
};
