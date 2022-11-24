import { DynamoEntityType } from './dynamo-entity-type';
import { EntityKey } from './entity-key';

export class BaseEntity extends EntityKey {
  entityType: DynamoEntityType;
}
