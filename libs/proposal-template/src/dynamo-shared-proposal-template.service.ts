import hash from 'object-hash';
import { Injectable, Logger } from '@nestjs/common';

import { SharedProposalTemplate } from '@sputnik-v2/proposal-template/entities';
import { CreateSharedProposalTemplateDto } from '@sputnik-v2/proposal-template/dto';

import {
  DynamodbService,
  DynamoEntityType,
  mapSharedProposalTemplateToSharedProposalTemplateModel,
  ProposalTemplateModel,
  SharedProposalTemplateModel,
} from '@sputnik-v2/dynamodb';
import { ConfigService } from '@nestjs/config';
import { buildEntityId, buildTemplateId } from '@sputnik-v2/utils';

@Injectable()
export class DynamoSharedProposalTemplateService {
  private readonly logger = new Logger(
    DynamoSharedProposalTemplateService.name,
  );

  constructor(
    private dynamoDbService: DynamodbService,
    private configService: ConfigService,
  ) {}

  async create(
    createProposalTemplate: CreateSharedProposalTemplateDto,
  ): Promise<Partial<SharedProposalTemplate>> {
    const { daoId, config } = createProposalTemplate;
    const { smartContractAddress, methodName } = config;
    const { contractName } = this.configService.get('near');

    const id = hash(
      smartContractAddress.endsWith(contractName)
        ? { methodName }
        : { smartContractAddress, methodName },
    );

    const existingTemplate =
      await this.dynamoDbService.getItemByType<SharedProposalTemplateModel>(
        daoId,
        DynamoEntityType.SharedProposalTemplate,
        id,
      );

    if (existingTemplate) {
      this.logger.log(
        `Shared Proposal Template already exists: ${id}. Skipping.`,
      );

      return existingTemplate;
    }

    this.logger.log(`Creating Shared Proposal Template: ${id}`);

    const newTemplate = {
      config: createProposalTemplate.config,
      createdAt: new Date(),
      createdBy: createProposalTemplate.createdBy,
      daoCount: 1,
      id: id,
      isArchived: false,
      name: createProposalTemplate.name,
      updatedAt: new Date(),
    };

    const templateModel =
      mapSharedProposalTemplateToSharedProposalTemplateModel(newTemplate);

    await this.dynamoDbService.saveItem<SharedProposalTemplateModel>({
      ...templateModel,
    });

    return newTemplate;
  }

  async cloneToDao(proposalTemplateId: string, toDao: string): Promise<void> {
    this.logger.log(
      `Cloning Shared Proposal Template ${proposalTemplateId} to DAO ${toDao}`,
    );

    const existingTemplate =
      await this.dynamoDbService.getItemByType<SharedProposalTemplateModel>(
        proposalTemplateId,
        DynamoEntityType.SharedProposalTemplate,
        proposalTemplateId,
      );

    if (!existingTemplate) {
      this.logger.log(
        `Cant find Shared Proposal Template ${proposalTemplateId} in Dynamo`,
      );

      return;
    }

    const newTemplate = {
      ...existingTemplate,
      partitionId: toDao,
      entityType: DynamoEntityType.ProposalTemplate,
      entityId: buildEntityId(
        DynamoEntityType.ProposalTemplate,
        buildTemplateId(toDao),
      ),
      daoCount: existingTemplate.daoCount + 1,
    };

    await this.dynamoDbService.saveItem<ProposalTemplateModel>(newTemplate);
  }
}
