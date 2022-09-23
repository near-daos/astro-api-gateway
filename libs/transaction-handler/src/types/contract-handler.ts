import { TransactionAction } from './transaction-action';
import { ContractHandlerResult } from './contract-handler-result';

export type ContractHandler = {
  contractId?: string;
  contractIdSuffix?: string;
  methodHandlers: {
    [key: string]: (
      action: TransactionAction,
    ) => Promise<ContractHandlerResult>;
  };
  defaultHandler?: (
    action: TransactionAction,
  ) => Promise<ContractHandlerResult>;
};
