import { BaseEntity } from '../types';

export class BaseModel extends BaseEntity {
  isArchived: boolean;
  createTimestamp: number;
  // TODO: rename to processingTimestamp or updateTimestamp
  processingTimeStamp: number;
}
