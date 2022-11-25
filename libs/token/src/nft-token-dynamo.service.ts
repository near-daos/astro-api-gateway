import { Injectable } from '@nestjs/common';
import {
  DaoStatsModel,
  DynamodbService,
  DynamoEntityType,
  mapNftTokenDtoToNftModel,
  NftModel,
  QueryItemsQuery,
} from '@sputnik-v2/dynamodb';
import { NFTTokenDto } from '@sputnik-v2/token';

@Injectable()
export class NFTTokenDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(nft: NFTTokenDto) {
    return this.dynamoDbService.saveItem<NftModel>(
      mapNftTokenDtoToNftModel(nft),
    );
  }

  async saveMultiple(nfts: NFTTokenDto[]) {
    return this.dynamoDbService.batchPut<NftModel>(
      nfts.map((nft) => mapNftTokenDtoToNftModel(nft)),
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
