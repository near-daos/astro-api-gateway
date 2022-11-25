import { ApiProperty } from '@nestjs/swagger';
import {
  ProposalKind,
  ProposalKindSwaggerDto,
  ProposalType,
} from '@sputnik-v2/proposal';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DraftProposalModel } from '@sputnik-v2/dynamodb/models';

export class UpdateDraftProposal {
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

export function mapUpdateDraftProposalToDraftProposalModel(
  draftProposal: DraftProposalModel,
  dto: UpdateDraftProposal,
  historyId: string,
): Partial<DraftProposalModel> {
  const history = draftProposal.history || [];
  return {
    ...draftProposal,
    title: dto.title,
    description: dto.description,
    kind: dto.kind as ProposalKind,
    type: dto.type,
    processingTimeStamp: Date.now(),
    viewAccounts: [],
    saveAccounts: [],
    history: [
      {
        id: historyId,
        daoId: draftProposal.partitionId,
        proposer: draftProposal.proposer,
        title: draftProposal.title,
        description: draftProposal.description,
        kind: draftProposal.kind,
        type: draftProposal.type,
        timestamp: draftProposal.processingTimeStamp,
      },
      ...history,
    ],
  };
}
