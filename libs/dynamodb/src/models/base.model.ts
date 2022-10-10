import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class BaseModel {
  id: string;
  entityType: DynamoEntityType;
  isArchived: boolean;
}
