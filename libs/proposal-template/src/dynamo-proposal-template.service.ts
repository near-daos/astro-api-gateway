import { Injectable } from '@nestjs/common';
import { ProposalTemplate } from '@sputnik-v2/proposal-template/entities';
import { ProposalTemplateDto } from '@sputnik-v2/proposal-template/dto';
import { buildEntityId, buildTemplateId } from '@sputnik-v2/utils';
import {
  DynamodbService,
  DynamoEntityType,
  mapProposalTemplateToProposalTemplateModel,
  ProposalTemplateModel,
} from '@sputnik-v2/dynamodb';

@Injectable()
export class DynamoProposalTemplateService {
  constructor(private dynamoDbService: DynamodbService) {}

  async create(
    proposalTemplate: ProposalTemplateDto,
  ): Promise<ProposalTemplate> {
    const templateId = buildTemplateId(proposalTemplate.daoId);
    const newProposalTemplate: ProposalTemplate = {
      config: proposalTemplate.config,
      createdAt: new Date(),
      dao: undefined,
      daoId: proposalTemplate.daoId,
      id: templateId,
      isArchived: false,
      isEnabled: proposalTemplate.isEnabled,
      name: proposalTemplate.name,
      updatedAt: new Date(),
    };

    const proposalTemplateModel =
      mapProposalTemplateToProposalTemplateModel(newProposalTemplate);

    await this.dynamoDbService.saveItem<ProposalTemplateModel>(
      proposalTemplateModel,
    );

    return newProposalTemplate;
  }

  async update(
    id: string,
    proposalTemplate: ProposalTemplateDto,
  ): Promise<void> {
    const newProposalTemplate = {
      partitionId: proposalTemplate.daoId,
      entityType: DynamoEntityType.ProposalTemplate,
      entityId: buildEntityId(DynamoEntityType.ProposalTemplate, id),
      config: proposalTemplate.config,
      isEnabled: proposalTemplate.isEnabled,
      name: proposalTemplate.name,
      daoId: proposalTemplate.daoId,
      updatedAt: new Date().getTime(),
    };

    await this.dynamoDbService.saveItem(newProposalTemplate);
  }

  async delete(daoId: string, id: string) {
    await this.dynamoDbService.archiveItemByType(
      daoId,
      DynamoEntityType.ProposalTemplate,
      id,
    );
  }
}
