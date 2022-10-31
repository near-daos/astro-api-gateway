import {
  ProposalTemplateConfigDto,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class SharedProposalTemplateModel extends BaseModel {
  id: string;
  createdBy: string;
  name: string;
  description?: string;
  config: ProposalTemplateConfigDto;
}

export function mapSharedProposalTemplateToSharedProposalTemplateModel(
  sharedProposalTemplate: SharedProposalTemplate,
  daoId: string,
): SharedProposalTemplateModel {
  return {
    partitionId: daoId,
    entityId: `${DynamoEntityType.SharedProposalTemplate}:${sharedProposalTemplate.id}`,
    entityType: DynamoEntityType.SharedProposalTemplate,
    isArchived: sharedProposalTemplate.isArchived,
    processingTimeStamp: Date.now(),
    id: sharedProposalTemplate.id,
    createdBy: sharedProposalTemplate.createdBy,
    name: sharedProposalTemplate.name,
    description: sharedProposalTemplate.description,
    config: sharedProposalTemplate.config,
  };
}
