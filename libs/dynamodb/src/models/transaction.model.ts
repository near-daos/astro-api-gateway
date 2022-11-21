import { BaseModel } from './base.model';

export class TransactionModel extends BaseModel {
  transactionHash: string;
  updateTransactionHash: string;
  // TODO: use bigint and timestamp with nanoseconds
  createTimestamp: number;
  updateTimestamp: number;
}
