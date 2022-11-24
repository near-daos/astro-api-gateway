import { BaseEntity } from '../types';

export class BaseModel extends BaseEntity {
  isArchived: boolean;
  // TODO: use bigint and timestamp with nanoseconds
  createTimestamp: number;
  processingTimeStamp: number;
}
