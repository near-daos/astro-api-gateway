import { Injectable } from '@nestjs/common';
import { Dao } from '@sputnik-v2/dao';
import {
  DynamoEntityType,
  mapDaoModelToDao,
  mapDaoToDaoModel,
} from '@sputnik-v2/dynamodb';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import { DaoModel } from '@sputnik-v2/dynamodb/models';

@Injectable()
export class DaoDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(dao: Partial<DaoModel>) {
    return this.dynamoDbService.saveItem<DaoModel>(dao);
  }

  async saveDao(dao: Dao) {
    return this.save(mapDaoToDaoModel(dao));
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
