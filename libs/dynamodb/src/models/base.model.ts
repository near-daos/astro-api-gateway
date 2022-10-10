import { DynamoEntityType } from '../types';

export type EntityId = `${DynamoEntityType}:${string}`;

export class BaseModel {
  daoId: string;
  entityId: EntityId;
  entityType: DynamoEntityType;
  isArchived: boolean;
}
