import { Injectable } from '@nestjs/common';
import {
  DaoStatsModel,
  DynamodbService,
  DynamoEntityType,
  mapNftTokenToNftModel,
  NftModel,
  QueryItemsQuery,
} from '@sputnik-v2/dynamodb';
import { NFTToken, NFTTokenDto } from '@sputnik-v2/token';

@Injectable()
export class NFTTokenDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(nft: NFTToken | NFTTokenDto) {
    return this.dynamoDbService.saveItem<NftModel>(mapNftTokenToNftModel(nft));
  }

  async saveMultiple(nfts: (NFTToken | NFTTokenDto)[]) {
    return this.dynamoDbService.batchPutChunked<NftModel>(
      nfts.map((nft) => mapNftTokenToNftModel(nft)),
    );
  }

  async count(accountId: string) {
    return this.dynamoDbService.countItemsByType(
      accountId,
      DynamoEntityType.Nft,
    );
  }

  async query(accountId: string, query: QueryItemsQuery = {}) {
    return this.dynamoDbService.queryItemsByType<DaoStatsModel>(
      accountId,
      DynamoEntityType.DaoStats,
      query,
    );
  }

  async delete(items) {
    await this.dynamoDbService.batchDelete<NftModel>(items);
  }
}
