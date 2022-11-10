import { DynamoEntityType, EntityId } from '.';

export class BaseEntity {
  partitionId: string;
  entityId: EntityId;
  entityType: DynamoEntityType;
}
