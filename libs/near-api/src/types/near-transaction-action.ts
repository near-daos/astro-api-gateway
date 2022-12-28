import { btoaJSON, decodeBase64 } from '@sputnik-v2/utils';

export type NearTransactionAction = {
  CreateAccount: any;
  DeployContract: any;
  FunctionCall: {
    methodName: string;
    deposit: string;
    gas: number;
    args: any;
  };
  Transfer: { deposit: string };
  Stake: any;
  AddKey: any;
  DeleteKey: any;
  DeleteAccount: any;
};

export type NearTransactionActionKind = keyof NearTransactionAction;

export function castTransactionAction(action): NearTransactionAction {
  const { FunctionCall } = action;

  if (FunctionCall) {
    return {
      ...action,
      FunctionCall: {
        methodName: FunctionCall.method_name,
        args: btoaJSON(FunctionCall.args),
      },
    };
  }

  return action;
}

export const castTransactionStatus = (status) => {
  if ('SuccessValue' in status) {
    return {
      ...status,
      SuccessValue: decodeBase64(status.SuccessValue),
    };
  }

  return status;
};
