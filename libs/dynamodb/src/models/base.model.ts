import { BaseEntity } from '../types';

export class BaseModel extends BaseEntity {
  isArchived: boolean;
  creatingTimeStamp: number; // milliseconds
  processingTimeStamp: number; // milliseconds
}
