import {
  ProposalTemplateConfigDto,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType, PartialEntity } from '../types';

export class SharedProposalTemplateModel extends BaseModel {
  id: string;
  createdBy: string;
  name: string;
  description?: string;
  config: ProposalTemplateConfigDto;
}

export function mapSharedProposalTemplateToSharedProposalTemplateModel(
  sharedProposalTemplate: Partial<SharedProposalTemplate>,
): PartialEntity<SharedProposalTemplateModel> {
  return {
    partitionId: sharedProposalTemplate.id,
    entityId: buildEntityId(
      DynamoEntityType.SharedProposalTemplate,
      sharedProposalTemplate.id,
    ),
    entityType: DynamoEntityType.SharedProposalTemplate,
    isArchived: !!sharedProposalTemplate.isArchived,
    createdAt: sharedProposalTemplate.createdAt
      ? sharedProposalTemplate.createdAt.getTime()
      : undefined,
    updatedAt: sharedProposalTemplate.updatedAt
      ? sharedProposalTemplate.updatedAt.getTime()
      : undefined,
    id: sharedProposalTemplate.id,
    createdBy: sharedProposalTemplate.createdBy,
    name: sharedProposalTemplate.name,
    description: sharedProposalTemplate.description,
    config: sharedProposalTemplate.config,
  };
}
