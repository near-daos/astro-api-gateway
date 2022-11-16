import { Token } from '@sputnik-v2/token/entities';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class TokenPriceModel extends BaseModel {
  price: string;
  decimals: number;
}

export function mapTokenToTokenPriceModel(
  token: Partial<Token>,
): TokenPriceModel {
  return {
    partitionId: token.id,
    entityId: buildEntityId(DynamoEntityType.TokenPrice, token.id),
    entityType: DynamoEntityType.TokenPrice,
    isArchived: false,
    processingTimeStamp: Date.now(),
    price: token.price,
    decimals: token.decimals,
    createTimestamp: token.createdAt.getTime(),
  };
}
