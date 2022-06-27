import { ProposalType } from '@sputnik-v2/proposal';
import { DraftProposal, DraftProposalState } from '@sputnik-v2/draft-proposal';
import { ApiProperty } from '@nestjs/swagger';

export class DraftProposalBasicResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  daoId: string;

  @ApiProperty()
  proposer: string;

  @ApiProperty()
  proposalId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({
    enum: ProposalType,
    enumName: 'ProposalType',
  })
  type: ProposalType;

  @ApiProperty({
    enum: DraftProposalState,
    enumName: 'DraftProposalState',
  })
  state: DraftProposalState;

  @ApiProperty({ type: [String] })
  hashtags: string[];

  @ApiProperty()
  views: number;

  @ApiProperty()
  replies: number;

  @ApiProperty()
  saves: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  isSaved: boolean;
}

export function castDraftProposalBasicResponse(
  draftProposal: DraftProposal,
  accountId?: string,
): DraftProposalBasicResponse {
  return {
    id: draftProposal.id.toString(),
    daoId: draftProposal.daoId,
    proposer: draftProposal.proposer,
    proposalId: draftProposal.proposalId,
    title: draftProposal.title,
    type: draftProposal.type,
    state: draftProposal.state,
    hashtags: draftProposal.hashtags,
    replies: draftProposal.replies,
    views: draftProposal.viewAccounts.length,
    saves: draftProposal.saveAccounts.length,
    updatedAt: draftProposal.updatedAt,
    createdAt: draftProposal.createdAt,
    isRead: accountId ? draftProposal.viewAccounts.includes(accountId) : false,
    isSaved: accountId ? draftProposal.saveAccounts.includes(accountId) : false,
  };
}
