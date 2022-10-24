import { DynamoEntityType } from './dynamo-entity-type';

export type EntityId = `${DynamoEntityType}:${string}`;
