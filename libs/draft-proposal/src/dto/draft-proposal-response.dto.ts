import { ApiProperty } from '@nestjs/swagger';
import { ProposalKindSwaggerDto } from '@sputnik-v2/proposal';
import {
  castDraftProposalBasicResponse,
  DraftProposalBasicResponse,
} from './draft-proposal-basic-response.dto';
import { DraftProposal, DraftProposalHistory } from '../entities';
import {
  castDraftProposalHistoryResponse,
  DraftProposalHistoryResponse,
} from './draft-proposal-history-response.dto';

export class DraftProposalResponse extends DraftProposalBasicResponse {
  @ApiProperty()
  description: string;

  @ApiProperty({ type: ProposalKindSwaggerDto })
  kind: ProposalKindSwaggerDto;

  @ApiProperty({ type: [DraftProposalHistoryResponse] })
  history: DraftProposalHistoryResponse[];
}

export function castDraftProposalResponse(
  draftProposal: DraftProposal,
  history: DraftProposalHistory[],
  accountId?: string,
): DraftProposalResponse {
  return {
    ...castDraftProposalBasicResponse(draftProposal, accountId),
    description: draftProposal.description,
    kind: draftProposal.kind as ProposalKindSwaggerDto,
    history: [draftProposal, ...history].map(castDraftProposalHistoryResponse),
  };
}
