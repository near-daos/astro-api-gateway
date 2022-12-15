import { BaseEntity } from '../types';

export class BaseModel extends BaseEntity {
  isArchived: boolean;
  createdAt?: number; // milliseconds
  updatedAt?: number; // milliseconds
  migratedAt?: number; // milliseconds
}
