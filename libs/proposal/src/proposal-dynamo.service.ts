import { Injectable } from '@nestjs/common';
import {
  CountItemsQuery,
  DynamoEntityType,
  mapProposalDtoToProposalModel,
  mapProposalToProposalModel,
  ProposalModel,
} from '@sputnik-v2/dynamodb';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import { Proposal } from '@sputnik-v2/proposal/entities';
import { ProposalDto } from './dto/proposal.dto';

@Injectable()
export class ProposalDynamoService {
  constructor(private readonly dynamoDbService: DynamodbService) {}

  async save(
    daoId: string,
    proposalId: string,
    proposal: Partial<ProposalModel> = {},
  ) {
    return this.dynamoDbService.saveItemByType<ProposalModel>(
      daoId,
      DynamoEntityType.Proposal,
      proposalId,
      proposal,
    );
  }

  async saveProposal(proposal: Partial<Proposal>) {
    return this.dynamoDbService.saveItem<ProposalModel>(
      mapProposalToProposalModel(proposal),
    );
  }

  async saveProposalDto(proposal: Partial<ProposalDto>) {
    return this.dynamoDbService.saveItem<ProposalModel>(
      mapProposalDtoToProposalModel(proposal),
    );
  }

  async get(daoId: string, proposalId: string) {
    return this.dynamoDbService.getItemByType<ProposalModel>(
      daoId,
      DynamoEntityType.Proposal,
      proposalId,
    );
  }

  async archive(daoId: string, proposalId: string, isArchived = true) {
    return this.dynamoDbService.archiveItemByType(
      daoId,
      DynamoEntityType.Proposal,
      proposalId,
      isArchived,
    );
  }

  async count(daoId: string, query?: CountItemsQuery) {
    return this.dynamoDbService.countItemsByType(
      daoId,
      DynamoEntityType.Proposal,
      query,
    );
  }
}
