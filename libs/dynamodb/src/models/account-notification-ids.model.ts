import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class AccountNotificationIdsModel extends BaseModel {
  accountId: string;
  notReadIds: string[];
  notArchivedIds: string[];
}

export function mapAccountNotificationIdsModel(
  accountId: string,
  notReadIds: string[],
  notArchivedIds: string[],
): AccountNotificationIdsModel {
  return {
    partitionId: accountId,
    entityId: buildEntityId(DynamoEntityType.AccountNotificationIds, accountId),
    entityType: DynamoEntityType.AccountNotificationIds,
    isArchived: false,
    processingTimeStamp: Date.now(),
    createTimestamp: Date.now(),
    accountId,
    notReadIds,
    notArchivedIds,
  };
}
