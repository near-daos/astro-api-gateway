import { Token } from '@sputnik-v2/token/entities';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class TokenPriceModel extends BaseModel {
  price: string;
  decimals: number;
}

export function mapTokenToTokenPriceModel(
  token: Partial<Token>,
): TokenPriceModel {
  return {
    partitionId: token.id,
    entityId: `${DynamoEntityType.TokenPrice}:${token.id}`,
    entityType: DynamoEntityType.TokenPrice,
    isArchived: false,
    processingTimeStamp: Date.now(),
    price: token.price,
    decimals: token.decimals,
  };
}
