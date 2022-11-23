import { Injectable } from '@nestjs/common';
import { Dao, DaoVersion } from '@sputnik-v2/dao';
import { DaoSettings } from '@sputnik-v2/dao-settings';
import {
  DaoIdsModel,
  DynamoEntityType,
  mapDaoIdsToDaoIdsModel,
  mapDaoModelToDao,
  mapDaoToDaoModel,
  mapDaoVersionToDaoVersionModel,
} from '@sputnik-v2/dynamodb';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import { DaoModel } from '@sputnik-v2/dynamodb/models';

@Injectable()
export class DaoDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(id: string, dao: Partial<DaoModel> = {}) {
    return this.dynamoDbService.saveItemByType<DaoModel>(
      id,
      DynamoEntityType.Dao,
      id,
      dao,
    );
  }

  async saveDao(dao: Dao) {
    return this.dynamoDbService.saveItem<DaoModel>(mapDaoToDaoModel(dao));
  }

  async saveDaoId(daoId: string) {
    const daoIds = await this.getDaoIds();
    daoIds.push(daoId);
    await this.dynamoDbService.saveItem(mapDaoIdsToDaoIdsModel(daoIds));
  }

  async saveDaoSettings(daoSettings: DaoSettings) {
    return this.save(daoSettings.daoId, { settings: daoSettings.settings });
  }

  async saveDaoVersion(id: string, version: DaoVersion) {
    return this.save(id, {
      daoVersion: version ? mapDaoVersionToDaoVersionModel(version) : undefined,
    });
  }

  async get(daoId: string) {
    return this.dynamoDbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );
  }

  async getDao(daoId: string) {
    const dao = await this.get(daoId);
    return dao ? mapDaoModelToDao(dao) : undefined;
  }

  async getDaoIds() {
    const daoIdsModel = await this.dynamoDbService.getItemByType<DaoIdsModel>(
      DynamoEntityType.DaoIds,
      DynamoEntityType.DaoIds,
      '1',
    );
    return daoIdsModel?.ids || [];
  }
}
