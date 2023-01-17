import { TransactionModel } from '@sputnik-v2/dynamodb';
import { NearTransactionActionKind } from '@sputnik-v2/near-api';

export class DaoFundsReceiptModel extends TransactionModel {
  daoId: string;
  receiptId: string;
  indexInReceipt: number;
  predecessorId: string;
  receiverId: string;
  kind: NearTransactionActionKind;
  deposit: string;

  // extra data
  methodName?: string;
  args?: any;
}
