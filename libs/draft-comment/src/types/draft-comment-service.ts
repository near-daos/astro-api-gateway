import {
  CreateDraftComment,
  DraftCommentContextParams,
  DraftCommentResponse,
  DraftCommentsRequest,
  UpdateDraftComment,
} from '@sputnik-v2/draft-comment';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';

export interface DraftCommentService {
  create(
    accountId: string,
    draftCommentDto: CreateDraftComment,
    commentIdId?: string,
  ): Promise<string>;

  update(
    params: DraftCommentContextParams,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string>;

  like(contextParams: DraftCommentContextParams): Promise<boolean>;
  removeLike(contextParams: DraftCommentContextParams): Promise<boolean>;
  dislike(contextParams: DraftCommentContextParams): Promise<boolean>;
  delete(contextParams: DraftCommentContextParams): Promise<DeleteResponse>;
  removeDislike(contextParams: DraftCommentContextParams): Promise<boolean>;
  getAll(
    params: DraftCommentsRequest,
  ): Promise<BaseResponseDto<DraftCommentResponse>>;
}
