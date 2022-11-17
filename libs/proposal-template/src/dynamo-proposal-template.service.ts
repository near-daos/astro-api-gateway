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
  ): Promise<ProposalTemplate> {
    const newProposalTemplate: ProposalTemplate = {
      config: proposalTemplate.config,
      createdAt: new Date(),
      dao: undefined,
      daoId: proposalTemplate.daoId,
      id: id,
      isArchived: false,
      isEnabled: proposalTemplate.isEnabled,
      name: proposalTemplate.name,
      updatedAt: new Date(),
    };

    const proposalTemplateModel =
      mapProposalTemplateToProposalTemplateModel(newProposalTemplate);

    await this.dynamoDbService.saveItem(proposalTemplateModel);

    return newProposalTemplate;
  }

  async delete(daoId: string, id: string) {
    await this.dynamoDbService.saveItem({
      partitionId: daoId,
      entityType: DynamoEntityType.ProposalTemplate,
      entityId: buildEntityId(DynamoEntityType.ProposalTemplate, id),
      isArchived: true,
    });
  }
}
