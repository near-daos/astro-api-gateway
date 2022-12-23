import { TransactionModel } from '@sputnik-v2/dynamodb';

export class DaoFundsReceiptModel extends TransactionModel {
  daoId: string;
  receiptId: string;
  indexInReceipt: number;
  predecessorId: string;
  receiverId: string;
  amount: string;
}
