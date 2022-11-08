import { Injectable } from '@nestjs/common';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  DaoStatsModel,
  mapDaoStatsModelToDaoStats,
  mapDaoStatsToDaoStatsModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import { DaoStats } from '@sputnik-v2/stats';
import { buildDaoStatsId } from '@sputnik-v2/utils';

@Injectable()
export class DaoStatsDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(daoStats) {
    return this.dynamoDbService.saveItem<DaoStatsModel>(daoStats);
  }

  async saveDaoStats(daoStats: DaoStats) {
    return this.save(mapDaoStatsToDaoStatsModel(daoStats));
  }

  async get(daoId: string, timestamp: number) {
    const id = buildDaoStatsId(daoId, timestamp);
    return this.dynamoDbService.getItemByType<DaoStatsModel>(
      daoId,
      DynamoEntityType.DaoStats,
      id,
    );
  }

  async getDaoStats(daoId: string, timestamp: number) {
    const daoStats = await this.get(daoId, timestamp);
    return daoStats ? mapDaoStatsModelToDaoStats(daoStats) : undefined;
  }

  async query(query) {
    return this.dynamoDbService.queryItems<DaoStatsModel>(query);
  }

  async queryDaoStats(query) {
    const items = await this.query(query);
    return items.map((item) => mapDaoStatsModelToDaoStats(item));
  }
}
