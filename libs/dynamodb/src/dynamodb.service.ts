import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { Dao } from '@sputnik-v2/dao';
import { Proposal } from '@sputnik-v2/proposal';
import { Bounty } from '@sputnik-v2/bounty';

import {
  BaseModel,
  BountyModel,
  DaoModel,
  mapBountyToBountyModel,
  mapDaoToDaoModel,
  mapProposalToProposalModel,
  ProposalModel,
} from './models';
import { DynamoTableName } from './types';

@Injectable()
export class DynamodbService {
  private client: AWS.DynamoDB.DocumentClient;

  constructor(private readonly configService: ConfigService) {
    const { region, endpoint } = configService.get('dynamodb');
    this.client = new AWS.DynamoDB.DocumentClient({
      region,
      endpoint,
    });
  }

  public async saveDao(dao: Dao) {
    return this.saveItem<DaoModel>(mapDaoToDaoModel(dao));
  }

  public async saveProposal(proposal: Proposal) {
    return this.saveItem<ProposalModel>(mapProposalToProposalModel(proposal));
  }

  public async saveBounty(bounty: Partial<Bounty>) {
    return this.saveItem<BountyModel>(mapBountyToBountyModel(bounty));
  }

  private async getItemById<M extends BaseModel = BaseModel>(
    id: string,
    tableName = DynamoTableName.AstroDao,
  ): Promise<M | null> {
    return await this.client
      .get({
        TableName: tableName,
        Key: { id },
      })
      .promise()
      .then(({ Item }) => Item as M)
      .catch(() => null);
  }

  private async saveItem<M extends BaseModel = BaseModel>(
    data: Partial<M>,
    tableName = DynamoTableName.AstroDao,
  ) {
    const item = await this.getItemById(data.id);
    return this.client
      .put({
        TableName: tableName,
        Item: item ? { ...item, ...data } : data,
      })
      .promise();
  }
}
