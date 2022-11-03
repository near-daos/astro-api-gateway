import {
  CloseDraftProposal,
  CreateDraftProposal,
  DraftProposalBasicResponse,
  DraftProposalRequest,
  DraftProposalResponse,
  UpdateDraftProposal,
} from '@sputnik-v2/draft-proposal/dto';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';

export enum DraftProposalState {
  Open = 'open',
  Closed = 'closed',
}

export interface DraftProposalService {
  create(
    accountId: string,
    draftProposalDto: CreateDraftProposal,
  ): Promise<string>;

  getAll(any: any): Promise<BaseResponseDto<DraftProposalBasicResponse>>;

  getOneById(
    id: string,
    query: DraftProposalRequest,
  ): Promise<DraftProposalResponse>;

  update(
    daoId: string,
    id: string,
    accountId: string,
    draftProposalDto: UpdateDraftProposal,
  ): Promise<string>;

  delete(daoId: string, id: string, accountId: string): Promise<DeleteResponse>;
  view(daoId: string, id: string, accountId: string): Promise<boolean>;
  save(daoId: string, id: string, accountId: string): Promise<boolean>;
  removeSave(daoId: string, id: string, accountId: string): Promise<boolean>;
  close(
    daoId: string,
    id: string,
    accountId: string,
    closeDraftProposalDto: CloseDraftProposal,
  ): Promise<boolean>;
  closeInternal(daoId: string, id: string, proposalId: string): Promise<void>;
}
