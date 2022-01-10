import {
  castTransactionAction,
  NearTransactionAction,
} from './near-transaction-action';

export type NearTransactionReceipt = {
  predecessor_id: string;
  receiver_id: string;
  receipt_id: string;
  receipt: {
    Action: {
      signer_id: string;
      signer_public_key: string;
      gas_price: string;
      output_data_receivers: string[];
      input_data_ids: string[];
      actions: NearTransactionAction[];
    };
  };
};

export function castTransactionReceipt(receipt): NearTransactionReceipt {
  return {
    ...receipt,
    receipt: receipt.receipt && {
      ...receipt.receipt,
      Action: {
        ...receipt.receipt.Action,
        actions: receipt.receipt.Action.actions.map(castTransactionAction),
      },
    },
  };
}
