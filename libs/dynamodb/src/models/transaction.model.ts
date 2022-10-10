import { BaseModel } from './base.model';

export class TransactionModel extends BaseModel {
  transactionHash: string;
  updateTransactionHash: string;
  createTimestamp: number;
  updateTimestamp: number;
}
