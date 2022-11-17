import { Injectable } from '@nestjs/common';
import { Dao } from '@sputnik-v2/dao';
import { DaoSettings } from '@sputnik-v2/dao-settings';
import {
  DaoIdsModel,
  DynamoEntityType,
  mapDaoModelToDao,
  mapDaoSettingsToDaoModel,
  mapDaoToDaoModel,
  PartialEntity,
} from '@sputnik-v2/dynamodb';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import { DaoModel } from '@sputnik-v2/dynamodb/models';

@Injectable()
export class DaoDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(dao: PartialEntity<DaoModel>) {
    return this.dynamoDbService.saveItem<DaoModel>(dao);
  }

  async saveDao(dao: Dao) {
    return this.dynamoDbService.saveItem(mapDaoToDaoModel(dao));
  }

  async saveDaoId(daoId: string) {
    const daoIdsModel = await this.dynamoDbService.getItemByType<DaoIdsModel>(
      DynamoEntityType.DaoIds,
      DynamoEntityType.DaoIds,
      '1',
    );
    if (!daoIdsModel.ids?.includes(daoId)) {
      daoIdsModel.ids.push(daoId);
      await this.dynamoDbService.saveItem(daoIdsModel);
    }
  }

  async saveDaoSettings(daoSettings: DaoSettings) {
    return this.save(mapDaoSettingsToDaoModel(daoSettings));
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
}
