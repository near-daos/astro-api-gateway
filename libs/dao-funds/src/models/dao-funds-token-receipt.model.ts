import { TransactionModel } from '@sputnik-v2/dynamodb';
import { NearTransactionActionKind } from '@sputnik-v2/near-api';

export class DaoFundsTokenReceiptModel extends TransactionModel {
  daoId: string;
  receiptId: string;
  indexInReceipt: number;
  senderId: string;
  receiverId: string;
  tokenId: string;
  kind: NearTransactionActionKind;
  amount: string;

  // extra data
  deposit?: string;
  methodName?: string;
  args?: any;
}
