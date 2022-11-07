import { Subscription } from '@sputnik-v2/subscription';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class SubscriptionModel extends BaseModel {
  id: string;
  accountId: string;
}

export function mapSubscriptionToSubscriptionModel(
  subscription: Subscription,
): SubscriptionModel {
  return {
    partitionId: subscription.daoId,
    entityId: `${DynamoEntityType.Subscription}:${subscription.id}`,
    entityType: DynamoEntityType.Subscription,
    isArchived: subscription.isArchived,
    processingTimeStamp: Date.now(),
    id: subscription.id,
    accountId: subscription.accountId,
    createTimestamp: subscription.createdAt.getTime(),
  };
}
