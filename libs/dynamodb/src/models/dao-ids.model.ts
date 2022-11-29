import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

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
    creatingTimeStamp: Date.now(),
    processingTimeStamp: Date.now(),
  };
}
