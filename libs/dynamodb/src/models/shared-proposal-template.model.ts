import {
  ProposalTemplateConfigDto,
  SharedProposalTemplate,
} from '@sputnik-v2/proposal-template';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

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
  daoId: string,
): SharedProposalTemplateModel {
  return {
    partitionId: daoId,
    entityId: buildEntityId(
      DynamoEntityType.SharedProposalTemplate,
      sharedProposalTemplate.id,
    ),
    entityType: DynamoEntityType.SharedProposalTemplate,
    isArchived: sharedProposalTemplate.isArchived,
    processingTimeStamp: Date.now(),
    id: sharedProposalTemplate.id,
    createdBy: sharedProposalTemplate.createdBy,
    name: sharedProposalTemplate.name,
    description: sharedProposalTemplate.description,
    createTimestamp: sharedProposalTemplate.createdAt.getTime(),
    config: sharedProposalTemplate.config,
    daoCount: sharedProposalTemplate.daoCount,
  };
}
