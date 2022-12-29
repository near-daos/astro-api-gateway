import {
  ProposalTemplate,
  ProposalTemplateConfigDto,
} from '@sputnik-v2/proposal-template';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType, PartialEntity } from '../types';

export class ProposalTemplateModel extends BaseModel {
  id: string;
  name: string;
  isEnabled: boolean;
  config: ProposalTemplateConfigDto;
  sourceTemplateId: string;
}

export function mapProposalTemplateToProposalTemplateModel(
  proposalTemplate: Partial<ProposalTemplate>,
): PartialEntity<ProposalTemplateModel> {
  return {
    partitionId: proposalTemplate.daoId,
    entityId: buildEntityId(
      DynamoEntityType.ProposalTemplate,
      proposalTemplate.id,
    ),
    entityType: DynamoEntityType.ProposalTemplate,
    isArchived: !!proposalTemplate.isArchived,
    createdAt: proposalTemplate.createdAt
      ? proposalTemplate.createdAt.getTime()
      : undefined,
    updatedAt: proposalTemplate.updatedAt
      ? proposalTemplate.updatedAt.getTime()
      : undefined,
    id: proposalTemplate.id,
    name: proposalTemplate.name,
    isEnabled: proposalTemplate.isEnabled,
    config: proposalTemplate.config,
  };
}
