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
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DraftCommentServiceFacade implements DraftCommentService {
  constructor(
    private readonly mongoDraftCommentService: MongoDraftCommentService,
    private readonly dynamoDraftCommentService: DynamoDraftCommentService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  async create(
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.create(accountId, draftCommentDto);
    }

    return this.mongoDraftCommentService.create(accountId, draftCommentDto);
  }

  async delete(params: DraftCommentContextParams): Promise<DeleteResponse> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.delete(params);
    }

    return this.mongoDraftCommentService.delete(params);
  }

  async dislike(params: DraftCommentContextParams): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.dislike(params);
    }
    return this.mongoDraftCommentService.dislike(params);
  }

  async getAll(
    params: DraftCommentsRequest,
  ): Promise<BaseResponseDto<DraftCommentResponse>> {
    return this.mongoDraftCommentService.getAll(params);
  }

  async like(params: DraftCommentContextParams): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.like(params);
    }
    return this.mongoDraftCommentService.like(params);
  }

  async removeDislike(params: DraftCommentContextParams): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.removeDislike(params);
    }
    return this.mongoDraftCommentService.removeDislike(params);
  }

  async removeLike(params: DraftCommentContextParams): Promise<boolean> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.removeLike(params);
    }
    return this.mongoDraftCommentService.removeLike(params);
  }

  async update(
    params: DraftCommentContextParams,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string> {
    if (
      await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo)
    ) {
      return this.dynamoDraftCommentService.update(params, draftCommentDto);
    }

    return this.mongoDraftCommentService.update(params, draftCommentDto);
  }
}
