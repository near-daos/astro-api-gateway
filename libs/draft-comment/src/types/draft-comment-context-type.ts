import {
  CreateDraftComment,
  DraftCommentResponse,
  DraftCommentsRequest,
  UpdateDraftComment,
} from '@sputnik-v2/draft-comment/dto';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';

export enum DraftCommentContextType {
  DraftProposal = 'DraftProposal',
}

export interface DraftCommentService {
  create(
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string>;

  update(
    daoId: string,
    commentId: string,
    accountId: string,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string>;

  like(daoId: string, commentId: string, accountId: string): Promise<boolean>;
  removeLike(
    daoId: string,
    commentId: string,
    accountId: string,
  ): Promise<boolean>;
  dislike(daoId: string, id: string, accountId: string): Promise<boolean>;
  delete(
    daoId: string,
    commentId: string,
    accountId: string,
  ): Promise<DeleteResponse>;
  removeDislike(
    daoId: string,
    commentId: string,
    accountId: string,
  ): Promise<boolean>;
  getAll(
    params: DraftCommentsRequest,
  ): Promise<BaseResponseDto<DraftCommentResponse>>;
}
