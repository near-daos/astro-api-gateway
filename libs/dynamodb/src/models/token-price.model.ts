import { Token } from '@sputnik-v2/token/entities';
import { buildEntityId } from '@sputnik-v2/utils';
import { TransactionModel } from './transaction.model';
import { DynamoEntityType, PartialEntity } from '../types';

export class TokenPriceModel extends TransactionModel {
  price: string;
  decimals: number;
}

export function mapTokenToTokenPriceModel(
  token: Partial<Token>,
): PartialEntity<TokenPriceModel> {
  return {
    partitionId: token.id,
    entityId: buildEntityId(DynamoEntityType.TokenPrice, token.id),
    entityType: DynamoEntityType.TokenPrice,
    isArchived: false,
    creatingTimeStamp: token.createdAt ? token.createdAt.getTime() : undefined,
    processingTimeStamp: token.updatedAt
      ? token.updatedAt.getTime()
      : undefined,
    transactionHash: token.transactionHash,
    updateTransactionHash: token.updateTransactionHash,
    createTimestamp: token.createTimestamp,
    updateTimestamp: token.updateTimestamp,
    price: token.price,
    decimals: token.decimals,
  };
}
