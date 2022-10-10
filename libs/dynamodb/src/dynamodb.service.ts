import * as AWS from 'aws-sdk';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

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

@Injectable()
export class DynamodbService {
  private client: AWS.DynamoDB.DocumentClient;

  private tableName: string;

  constructor(private readonly configService: ConfigService) {
    const { region, endpoint, tableName, accessKeyId, secretAccessKey } =
      configService.get('dynamodb');

    let options: DocumentClient.DocumentClientOptions &
      DynamoDB.Types.ClientConfiguration = {
      region,
      credentials: { accessKeyId, secretAccessKey },
    };

    if (endpoint) {
      options = { ...options, endpoint };
    }

    this.client = new AWS.DynamoDB.DocumentClient({ ...options });

    this.tableName = tableName;
  }

  public async saveDao(dao: Dao) {
    return this.saveItem<DaoModel>(mapDaoToDaoModel(dao));
  }

  public async saveProposal(proposal: Proposal) {
    return this.saveItem<ProposalModel>(mapProposalToProposalModel(proposal));
  }

  public async saveBounty(bounty: Partial<Bounty>, proposalId?: number) {
    return this.saveItem<BountyModel>(
      mapBountyToBountyModel(bounty, proposalId),
    );
  }

  private async getItemById<M extends BaseModel = BaseModel>(
    daoId: string,
    entityId: string,
    tableName = this.tableName,
  ): Promise<M | null> {
    return await this.client
      .get({
        TableName: tableName,
        Key: { daoId, entityId },
      })
      .promise()
      .then(({ Item }) => Item as M)
      .catch(() => null);
  }

  private async saveItem<M extends BaseModel = BaseModel>(
    data: Partial<M>,
    tableName = this.tableName,
  ) {
    const item = await this.getItemById(data.daoId, data.entityId);
    return this.client
      .put({
        TableName: tableName,
        Item: item ? { ...item, ...data } : data,
      })
      .promise();
  }
}
