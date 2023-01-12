import { Injectable } from '@nestjs/common';
import { ProposalTemplateDto } from '@sputnik-v2/proposal-template/dto';
import { buildEntityId, buildTemplateId } from '@sputnik-v2/utils';
import {
  DynamodbService,
  DynamoEntityType,
  ProposalTemplateModel,
  SharedProposalTemplateModel,
} from '@sputnik-v2/dynamodb';

@Injectable()
export class DynamoProposalTemplateService {
  constructor(private dynamoDbService: DynamodbService) {}

  async create(
    proposalTemplate: Partial<SharedProposalTemplateModel> & {
      isEnabled: boolean;
      daoId: string;
    },
  ): Promise<ProposalTemplateModel> {
    const templateId = buildTemplateId(proposalTemplate.daoId);
    const newProposalTemplate: ProposalTemplateModel = {
      entityId: buildEntityId(DynamoEntityType.ProposalTemplate, templateId),
      entityType: DynamoEntityType.ProposalTemplate,
      config: proposalTemplate.config,
      createdAt: new Date().getTime(),
      partitionId: proposalTemplate.daoId,
      id: templateId,
      sourceTemplateId: proposalTemplate.id,
      isArchived: false,
      isEnabled: proposalTemplate.isEnabled,
      name: proposalTemplate.name,
      updatedAt: new Date().getTime(),
    };

    await this.dynamoDbService.saveItem<ProposalTemplateModel>(
      newProposalTemplate,
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
