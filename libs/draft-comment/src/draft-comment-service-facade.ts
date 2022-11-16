import {
  DraftCommentContextParams,
  DraftCommentService,
} from '@sputnik-v2/draft-comment/types';
import {
  CreateDraftComment,
  DraftCommentResponse,
  DraftCommentsRequest,
  UpdateDraftComment,
} from '@sputnik-v2/draft-comment/dto';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';
import { MongoDraftCommentService } from '@sputnik-v2/draft-comment/mongo-draft-comment.service';
import { DynamoDraftCommentService } from '@sputnik-v2/draft-comment/dynamo-draft-comment.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DraftCommentServiceFacade implements DraftCommentService {
  constructor(
    private readonly mongoDraftCommentService: MongoDraftCommentService,
    private readonly dynamoDraftCommentService: DynamoDraftCommentService,
  ) {}

  async create(
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    const commentId = await this.mongoDraftCommentService.create(
      accountId,
      draftCommentDto,
    );

    await this.dynamoDraftCommentService.create(
      accountId,
      draftCommentDto,
      commentId,
    );

    return commentId;
  }

  async delete(params: DraftCommentContextParams): Promise<DeleteResponse> {
    await this.dynamoDraftCommentService.delete(params);
    return this.mongoDraftCommentService.delete(params);
  }

  async dislike(params: DraftCommentContextParams): Promise<boolean> {
    await this.dynamoDraftCommentService.dislike(params);
    return this.mongoDraftCommentService.dislike(params);
  }

  async getAll(
    params: DraftCommentsRequest,
  ): Promise<BaseResponseDto<DraftCommentResponse>> {
    return this.mongoDraftCommentService.getAll(params);
  }

  async like(params: DraftCommentContextParams): Promise<boolean> {
    await this.dynamoDraftCommentService.like(params);
    return this.mongoDraftCommentService.like(params);
  }

  async removeDislike(params: DraftCommentContextParams): Promise<boolean> {
    await this.dynamoDraftCommentService.removeDislike(params);
    return this.mongoDraftCommentService.removeDislike(params);
  }

  async removeLike(params: DraftCommentContextParams): Promise<boolean> {
    await this.dynamoDraftCommentService.removeLike(params);
    return this.mongoDraftCommentService.removeLike(params);
  }

  async update(
    params: DraftCommentContextParams,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string> {
    await this.dynamoDraftCommentService.update(params, draftCommentDto);
    return this.mongoDraftCommentService.update(params, draftCommentDto);
  }
}
