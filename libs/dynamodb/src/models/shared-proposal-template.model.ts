import {
  ProposalTemplateConfigDto,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class SharedProposalTemplateModel extends BaseModel {
  id: string;
  createdBy: string;
  name: string;
  description?: string;
  config: ProposalTemplateConfigDto;
  daoCount: number;
}

export function mapSharedProposalTemplateToSharedProposalTemplateModel(
  sharedProposalTemplate: SharedProposalTemplate,
): SharedProposalTemplateModel {
  return {
    partitionId: sharedProposalTemplate.id,
    entityId: buildEntityId(
      DynamoEntityType.SharedProposalTemplate,
      sharedProposalTemplate.id,
    ),
    entityType: DynamoEntityType.SharedProposalTemplate,
    isArchived: sharedProposalTemplate.isArchived,
    creatingTimeStamp: sharedProposalTemplate.createdAt.getTime(),
    processingTimeStamp: sharedProposalTemplate.updatedAt.getTime(),
    id: sharedProposalTemplate.id,
    createdBy: sharedProposalTemplate.createdBy,
    name: sharedProposalTemplate.name,
    description: sharedProposalTemplate.description,
    config: sharedProposalTemplate.config,
    daoCount: sharedProposalTemplate.daoCount,
  };
}
