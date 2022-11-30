import { Injectable } from '@nestjs/common';
import { Dao, DaoVersionDto } from '@sputnik-v2/dao';
import { DaoSettings } from '@sputnik-v2/dao-settings';
import {
  DaoDelegationModel,
  DaoIdsModel,
  DynamoEntityType,
  mapDaoIdsToDaoIdsModel,
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

  async saveDao(dao: Partial<Dao>) {
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

  async saveDaoVersion(id: string, version: DaoVersionDto) {
    return this.save(id, {
      daoVersion: version ? mapDaoVersionToDaoVersionModel(version) : undefined,
    });
  }

  async saveDelegation(delegation: DaoDelegationModel) {
    const dao = await this.get(delegation.daoId);

    if (dao) {
      const delegations = dao.delegations;
      const index = delegations.findIndex((d) => d.id === delegation.id);

      if (index >= 0) {
        delegations[index] = {
          ...delegations[index],
          ...delegation,
        };
      } else {
        delegations.push(delegation);
      }
      const delegationAccounts = delegations.map(({ accountId }) => accountId);
      const accountIds = [
        ...new Set(dao.accountIds.concat(delegationAccounts)),
      ].filter((accountId) => accountId);

      await this.save(delegation.daoId, {
        delegations,
        accountIds,
        numberOfMembers: accountIds.length,
      });
    }
  }

  async get(daoId: string) {
    return this.dynamoDbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );
  }

  async getDaoIds() {
    const daoIdsModel = await this.dynamoDbService.getItemByType<DaoIdsModel>(
      DynamoEntityType.DaoIds,
      DynamoEntityType.DaoIds,
      '1',
    );
    return daoIdsModel?.ids || [];
  }

  async getDelegations(daoId: string): Promise<DaoDelegationModel[]> {
    return (
      await this.dynamoDbService.getItemByType<DaoModel>(
        daoId,
        DynamoEntityType.Dao,
        daoId,
      )
    ).delegations;
  }
}
