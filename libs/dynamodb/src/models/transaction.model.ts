import { BaseModel } from './base.model';

export class TransactionModel extends BaseModel {
  transactionHash: string;
  updateTransactionHash: string;
  createTimestamp: string; // nanoseconds
  updateTimestamp: string; // nanoseconds
}
