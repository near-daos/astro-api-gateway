import { buildEntityId } from '@sputnik-v2/utils';
import { ErrorStatus, ErrorType } from '@sputnik-v2/error-tracker/types';
import { DynamoEntityType } from '../types';
import { BaseModel } from './base.model';
import { ErrorEntity } from '@sputnik-v2/error-tracker';

export class ErrorModel extends BaseModel {
  id: string;
  type: ErrorType;
  status: ErrorStatus;
  reason: string;
  metadata: Record<string, any>;
}

export function mapErrorEntityToErrorModel(error: ErrorEntity): ErrorModel {
  return {
    partitionId: DynamoEntityType.Error,
    entityId: buildEntityId(DynamoEntityType.Error, error.id),
    entityType: DynamoEntityType.DaoIds,
    id: error.id,
    type: error.type,
    status: error.status,
    reason: error.reason,
    metadata: error.metadata,
    isArchived: false,
    creatingTimeStamp: new Date(error.createdAt).getTime(),
    processingTimeStamp: Date.now(),
  };
}
