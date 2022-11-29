import { Token } from '@sputnik-v2/token/entities';
import { buildEntityId } from '@sputnik-v2/utils';
import { TransactionModel } from './transaction.model';
import { DynamoEntityType } from '../types';

export class TokenPriceModel extends TransactionModel {
  price: string;
  decimals: number;
}

export function mapTokenToTokenPriceModel(token: Token): TokenPriceModel {
  return {
    partitionId: token.id,
    entityId: buildEntityId(DynamoEntityType.TokenPrice, token.id),
    entityType: DynamoEntityType.TokenPrice,
    isArchived: false,
    creatingTimeStamp: token.createdAt.getTime(),
    processingTimeStamp: token.updatedAt.getTime(),
    transactionHash: token.transactionHash,
    updateTransactionHash: token.updateTransactionHash || token.transactionHash,
    createTimestamp: token.createTimestamp,
    updateTimestamp: token.updateTimestamp || token.createTimestamp,
    price: token.price,
    decimals: token.decimals,
  };
}
