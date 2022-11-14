import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb';

export class DaoIdsModel extends BaseModel {
  ids: string[];
}

export function mapDaoIdsToDaoIdsModel(ids: string[]): DaoIdsModel {
  return {
    partitionId: DynamoEntityType.DaoIds,
    entityId: buildEntityId(DynamoEntityType.DaoIds, '1'),
    entityType: DynamoEntityType.DaoIds,
    ids,
    isArchived: false,
    processingTimeStamp: Date.now(),
    createTimestamp: Date.now(),
  };
}
