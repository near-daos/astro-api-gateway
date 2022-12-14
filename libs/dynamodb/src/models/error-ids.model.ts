import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class ErrorIdsModel extends BaseModel {
  openErrorIds: string[];
}

export function mapErrorIdsToErrorIdsModel(
  openErrorIds: string[],
): ErrorIdsModel {
  return {
    partitionId: DynamoEntityType.ErrorIds,
    entityId: buildEntityId(DynamoEntityType.ErrorIds, '1'),
    entityType: DynamoEntityType.ErrorIds,
    openErrorIds,
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
