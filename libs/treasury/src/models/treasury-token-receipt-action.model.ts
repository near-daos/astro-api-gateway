import { TransactionModel } from '@sputnik-v2/dynamodb';

export class TreasuryTokenReceiptActionModel extends TransactionModel {
  daoId: string;
  receiptId: string;
  indexInReceipt: number;
  senderId: string;
  receiverId: string;
  tokenId: string;
  amount: string;
}
