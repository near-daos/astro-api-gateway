import { BaseEntity } from '../types';

export class BaseModel extends BaseEntity {
  isArchived: boolean;
  processingTimeStamp: number;
  createTimestamp: number;
}
