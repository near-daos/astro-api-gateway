import { BaseModel } from './base.model';

export class TransactionModel extends BaseModel {
  transactionHash: string;
  updateTransactionHash: string;
  // TODO: use bigint and timestamp with nanoseconds
  createBlockTimestamp: number;
  updateBlockTimestamp: number;
}
