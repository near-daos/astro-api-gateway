import { Injectable } from '@nestjs/common';
import { Bounty } from '@sputnik-v2/bounty/entities';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  BountyModel,
  mapBountyToBountyModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType, QueryItemsQuery } from '@sputnik-v2/dynamodb/types';

@Injectable()
export class BountyDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(bounty) {
    return this.dynamoDbService.saveItem<BountyModel>(bounty);
  }

  async saveMultiple(bounty) {
    return this.dynamoDbService.batchPut<BountyModel>(bounty);
  }

  async saveBounty(bounty: Partial<Bounty>, proposalId?: number) {
    return this.save(mapBountyToBountyModel(bounty, proposalId));
  }

  async saveMultipleBounties(bounties: Partial<Bounty>[]) {
    return this.save(bounties.map((bounty) => mapBountyToBountyModel(bounty)));
  }

  async archive(daoId: string, proposalId: number, isArchived = true) {
    return this.dynamoDbService.archiveItemByType(
      daoId,
      DynamoEntityType.Bounty,
      String(proposalId),
      isArchived,
    );
  }

  async query(daoId: string, query: QueryItemsQuery = {}) {
    return this.dynamoDbService.queryItemsByType<BountyModel>(
      daoId,
      DynamoEntityType.Bounty,
      query,
    );
  }

  async count(daoId: string, query: QueryItemsQuery = {}) {
    return this.dynamoDbService.countItemsByType(
      daoId,
      DynamoEntityType.Bounty,
      query,
    );
  }
}
