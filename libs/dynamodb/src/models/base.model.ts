import { DynamoEntityType, EntityId } from '../types';

export class BaseModel {
  partitionId: string;
  entityId: EntityId;
  entityType: DynamoEntityType;
  isArchived: boolean;
}
