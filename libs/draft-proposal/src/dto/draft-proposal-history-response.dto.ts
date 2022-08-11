import { ProposalKindSwaggerDto, ProposalType } from '@sputnik-v2/proposal';
import { DraftProposalHistory } from '@sputnik-v2/draft-proposal';
import { ApiProperty } from '@nestjs/swagger';

export class DraftProposalHistoryResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  daoId: string;

  @ApiProperty({ required: false })
  draftProposalId: string;

  @ApiProperty()
  proposer: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    enum: ProposalType,
    enumName: 'ProposalType',
  })
  type: ProposalType;

  @ApiProperty({ type: ProposalKindSwaggerDto })
  kind: ProposalKindSwaggerDto;

  @ApiProperty()
  updatedAt: Date;
}

export function castDraftProposalHistoryResponse(
  draftProposalHistory: DraftProposalHistory,
): DraftProposalHistoryResponse {
  return {
    id: draftProposalHistory.id.toString(),
    draftProposalId: draftProposalHistory.draftProposalId,
    daoId: draftProposalHistory.daoId,
    proposer: draftProposalHistory.proposer,
    title: draftProposalHistory.title,
    description: draftProposalHistory.description,
    type: draftProposalHistory.type,
    kind: draftProposalHistory.kind as ProposalKindSwaggerDto,
    updatedAt: draftProposalHistory.date || draftProposalHistory.updatedAt,
  };
}
