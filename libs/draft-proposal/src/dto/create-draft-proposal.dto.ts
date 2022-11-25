import { ApiProperty } from '@nestjs/swagger';
import { ProposalKindSwaggerDto, ProposalType } from '@sputnik-v2/proposal';
import { buildEntityId } from '@sputnik-v2/utils';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import { DraftProposalModel } from '@sputnik-v2/dynamodb/models';
import { DraftProposalState } from '@sputnik-v2/draft-proposal/types';

export class CreateDraftProposal {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  daoId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: ProposalType,
    enumName: 'ProposalType',
  })
  @IsEnum(ProposalType)
  @IsNotEmpty()
  type: ProposalType;

  @ApiProperty({ type: ProposalKindSwaggerDto })
  @IsNotEmpty()
  kind: ProposalKindSwaggerDto;
}

export function mapCreateDraftProposalToDraftProposalModel(
  id: string,
  proposer: string,
  dto: CreateDraftProposal,
): Partial<DraftProposalModel> {
  return {
    partitionId: dto.daoId,
    entityId: buildEntityId(DynamoEntityType.DraftProposal, id),
    entityType: DynamoEntityType.DraftProposal,
    isArchived: false,
    id: id,
    proposer: proposer,
    title: dto.title,
    description: dto.description,
    kind: dto.kind,
    type: dto.type,
    state: DraftProposalState.Open,
    replies: 0,
    viewAccounts: [],
    saveAccounts: [],
    createTimestamp: Date.now(),
    processingTimeStamp: Date.now(),
  };
}
