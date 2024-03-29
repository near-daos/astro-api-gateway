import { Subscription } from '@sputnik-v2/subscription';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType, PartialEntity } from '../types';

export class SubscriptionModel extends BaseModel {
  id: string;
  accountId: string;
}

export function mapSubscriptionToSubscriptionModel(
  subscription: Partial<Subscription>,
): PartialEntity<SubscriptionModel> {
  return {
    partitionId: subscription.daoId,
    entityId: buildEntityId(DynamoEntityType.Subscription, subscription.id),
    entityType: DynamoEntityType.Subscription,
    isArchived: !!subscription.isArchived,
    createdAt: subscription.createdAt
      ? subscription.createdAt.getTime()
      : undefined,
    updatedAt: subscription.updatedAt
      ? subscription.updatedAt.getTime()
      : undefined,
    id: subscription.id,
    accountId: subscription.accountId,
  };
}
