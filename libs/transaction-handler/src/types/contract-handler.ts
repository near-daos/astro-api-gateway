import { TransactionAction } from './transaction-action';

export type ContractHandler = {
  contractId?: string;
  contractIdSuffix?: string;
  methodHandlers: {
    [key: string]: (action: TransactionAction) => Promise<void>;
  };
  defaultHandler?: (action: TransactionAction) => Promise<void>;
};
