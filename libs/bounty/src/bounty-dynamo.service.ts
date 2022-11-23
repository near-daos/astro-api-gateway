import { Injectable } from '@nestjs/common';
import { BountyContextDto } from '@sputnik-v2/bounty/dto';
import { Bounty } from '@sputnik-v2/bounty/entities';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  BountyModel,
  mapBountyContextToBountyModel,
  mapBountyToBountyModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType, QueryItemsQuery } from '@sputnik-v2/dynamodb/types';

@Injectable()
export class BountyDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(daoId, bountyId, bounty: Partial<BountyModel>) {
    return this.dynamoDbService.saveItemByType<BountyModel>(
      daoId,
      DynamoEntityType.Bounty,
      bountyId,
      bounty,
    );
  }

  async saveMultiple(bounty) {
    return this.dynamoDbService.batchPut<BountyModel>(bounty);
  }

  async saveBounty(bounty: Partial<Bounty>, proposalId?: number) {
    return this.dynamoDbService.saveItem<BountyModel>(
      mapBountyToBountyModel(bounty, proposalId),
    );
  }

  async saveMultipleBounties(bounties: Partial<Bounty>[], proposalId?: number) {
    return this.dynamoDbService.batchPut<BountyModel>(
      bounties.map((bounty) => mapBountyToBountyModel(bounty, proposalId)),
    );
  }

  async saveMultipleBountyContexts(bountyContexts: BountyContextDto[]) {
    return this.dynamoDbService.batchPut(
      bountyContexts.map((bountyContext) =>
        mapBountyContextToBountyModel(bountyContext),
      ),
    );
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
