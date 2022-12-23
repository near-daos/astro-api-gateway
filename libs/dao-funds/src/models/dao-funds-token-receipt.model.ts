import { TransactionModel } from '@sputnik-v2/dynamodb';

export class DaoFundsTokenReceiptModel extends TransactionModel {
  daoId: string;
  receiptId: string;
  indexInReceipt: number;
  senderId: string;
  receiverId: string;
  tokenId: string;
  amount: string;
}
