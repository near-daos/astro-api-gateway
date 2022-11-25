import { BaseEntity } from '../types';

export class BaseModel extends BaseEntity {
  isArchived: boolean;
  createTimestamp: number;
  processingTimeStamp: number;
}
