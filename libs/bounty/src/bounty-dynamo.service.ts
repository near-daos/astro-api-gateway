import { Injectable } from '@nestjs/common';
import { BountyContextDto, BountyDto } from '@sputnik-v2/bounty/dto';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  BountyMappingModel,
  BountyModel,
  mapBountyContextDtoToBountyModel,
  mapBountyDtoToBountyModel,
} from '@sputnik-v2/dynamodb/models';
import {
  DynamoEntityType,
  PartialEntity,
  QueryItemsQuery,
} from '@sputnik-v2/dynamodb/types';
import { buildEntityId } from '@sputnik-v2/utils';

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

  async saveBountyMapping(
    partitionId: string,
    bountyId: number,
    bountyProposalId: number,
  ) {
    return this.dynamoDbService.saveItem<BountyMappingModel>({
      partitionId,
      entityId: buildEntityId(DynamoEntityType.BountyMapping, String(bountyId)),
      entityType: DynamoEntityType.BountyMapping,
      bountyProposalId,
    });
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

  async getByBountyId(
    daoId: string,
    bountyId: string,
  ): Promise<PartialEntity<BountyModel> | undefined> {
    const bountyMapping =
      await this.dynamoDbService.getItemByType<BountyMappingModel>(
        daoId,
        DynamoEntityType.BountyMapping,
        bountyId,
      );

    if (!bountyMapping) {
      return;
    }

    return this.dynamoDbService.getItemByType<BountyModel>(
      daoId,
      DynamoEntityType.Bounty,
      String(bountyMapping.bountyProposalId),
    );
  }

  async addBountyDoneProposalId(
    daoId: string,
    bountyId: string,
    proposalId: string,
  ) {
    const bounty = await this.getByBountyId(daoId, bountyId);

    if (!bounty) {
      throw new Error(
        `No bounty found by daoId: ${daoId} and bountyId: ${bountyId}`,
      );
    }

    if (!Array.isArray(bounty.bountyDoneProposalIds)) {
      bounty.bountyDoneProposalIds = [];
    }

    if (!bounty.bountyDoneProposalIds.includes(proposalId)) {
      bounty.bountyDoneProposalIds.push(proposalId);
      await this.dynamoDbService.saveItem<BountyModel>(bounty);
    }
  }
}
