import { BaseEntity } from '../types';

export class BaseModel extends BaseEntity {
  isArchived: boolean;
  processingTimeStamp: number;
  // TODO: use bigint and timestamp with nanoseconds
  createTimestamp: number;
}
