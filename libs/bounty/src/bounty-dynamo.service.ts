import { Injectable } from '@nestjs/common';
import { BountyContextDto, BountyDto } from '@sputnik-v2/bounty/dto';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  BountyModel,
  mapBountyContextDtoToBountyModel,
  mapBountyDtoToBountyModel,
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

  async saveBounty(bountyDto: Partial<BountyDto>) {
    return this.dynamoDbService.saveItem<BountyModel>(
      mapBountyDtoToBountyModel(bountyDto),
    );
  }

  async saveBountyContext(
    bountyContext: BountyContextDto,
    proposalIndex: number,
  ) {
    return this.dynamoDbService.saveItem<BountyModel>(
      mapBountyContextDtoToBountyModel(bountyContext, proposalIndex),
    );
  }

  async archive(daoId: string, proposalId: number, isArchived = true) {
    return this.dynamoDbService.archiveItemByType<BountyModel>(
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

  async get(daoId: string, bountyId: string) {
    return this.dynamoDbService.getItemByType<BountyModel>(
      daoId,
      DynamoEntityType.Bounty,
      bountyId,
    );
  }
}
