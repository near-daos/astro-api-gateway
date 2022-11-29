import {
  ProposalTemplate,
  ProposalTemplateConfigDto,
} from '@sputnik-v2/proposal-template';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class ProposalTemplateModel extends BaseModel {
  id: string;
  name: string;
  isEnabled: boolean;
  config: ProposalTemplateConfigDto;
}

export function mapProposalTemplateToProposalTemplateModel(
  proposalTemplate: ProposalTemplate,
): ProposalTemplateModel {
  return {
    partitionId: proposalTemplate.daoId,
    entityId: buildEntityId(
      DynamoEntityType.ProposalTemplate,
      proposalTemplate.id,
    ),
    entityType: DynamoEntityType.ProposalTemplate,
    isArchived: proposalTemplate.isArchived,
    creatingTimeStamp: proposalTemplate.createdAt.getTime(),
    processingTimeStamp: proposalTemplate.updatedAt.getTime(),
    id: proposalTemplate.id,
    name: proposalTemplate.name,
    isEnabled: proposalTemplate.isEnabled,
    config: proposalTemplate.config,
  };
}
