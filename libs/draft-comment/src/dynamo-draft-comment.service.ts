import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventService } from '@sputnik-v2/event';
import {
  CommentModel,
  DaoModel,
  DraftProposalModel,
  DynamodbService,
  DynamoEntityType,
} from '@sputnik-v2/dynamodb';
import {
  CreateDraftComment,
  DraftCommentResponse,
  UpdateDraftComment,
} from '@sputnik-v2/draft-comment/dto';
import {
  DraftCommentContextParams,
  DraftCommentContextType,
  DraftCommentService,
} from '@sputnik-v2/draft-comment/types';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';
import { getAccountPermissions } from '@sputnik-v2/utils';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';

@Injectable()
export class DynamoDraftCommentService implements DraftCommentService {
  constructor(
    private eventService: EventService,
    private dynamodbService: DynamodbService,
    private featureFlagService: FeatureFlagsService,
  ) {}

  getAll(): Promise<BaseResponseDto<DraftCommentResponse>> {
    throw new Error('Method not implemented.');
  }

  private async getComment({
    daoId,
    draftId,
    commentId,
  }: DraftCommentContextParams) {
    return this.dynamodbService.getItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      `${draftId}:${commentId}`,
    );
  }

  private async createDraftProposalComment(
    daoId: string,
    accountId: string,
    draftCommentDto: CreateDraftComment,
    commentId: string,
  ): Promise<string> {
    const comment = await this.createDraftProposalCommentInDynamo(
      daoId,
      accountId,
      commentId,
      draftCommentDto,
    );

    await this.incrementDraftProposalReplies(daoId, draftCommentDto.contextId);

    if (await this.useDynamo()) {
      await this.eventService.sendNewDraftCommentEvent(comment);
    }

    return commentId;
  }

  private async useDynamo() {
    return await this.featureFlagService.check(
      FeatureFlags.DraftCommentsDynamo,
    );
  }

  async incrementDraftProposalReplies(
    daoId: string,
    draftId: string,
    value = 1,
  ) {
    await this.dynamodbService.incrementByType<DraftProposalModel>(
      daoId,
      DynamoEntityType.DraftProposal,
      draftId,
      'replies',
      value,
    );
  }

  private async createDraftCommentReply(
    daoId: string,
    accountId: string,
    draftCommentDto: CreateDraftComment,
    commentId: string,
  ): Promise<string> {
    const reply = await this.createDraftProposalCommentInDynamo(
      daoId,
      accountId,
      commentId,
      draftCommentDto,
    );

    await this.incrementDraftProposalReplies(daoId, draftCommentDto.contextId);

    if (await this.useDynamo()) {
      await this.eventService.sendNewDraftCommentEvent(reply);
    }

    return reply.id;
  }

  create(
    accountId: string,
    draftCommentDto: CreateDraftComment,
    commentId: string,
  ): Promise<string> {
    if (draftCommentDto.replyTo) {
      return this.createDraftCommentReply(
        draftCommentDto.daoId,
        accountId,
        draftCommentDto,
        commentId,
      );
    }

    if (draftCommentDto.contextType === DraftCommentContextType.DraftProposal) {
      return this.createDraftProposalComment(
        draftCommentDto.daoId,
        accountId,
        draftCommentDto,
        commentId,
      );
    }
  }

  private async updateDraftProposalCommentInDynamo(
    daoId: string,
    draftId: string,
    commentId: string,
    comment: Partial<CommentModel>,
  ) {
    await this.dynamodbService.saveItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      `${draftId}:${commentId}`,
      comment,
    );
  }

  private async createDraftProposalCommentInDynamo(
    daoId: string,
    accountId: string,
    commentId: string,
    comment: CreateDraftComment,
  ) {
    const model: CommentModel = {
      partitionId: daoId,
      entityId: `${DynamoEntityType.DraftProposalComment}:${comment.contextId}:${commentId}`,
      entityType: DynamoEntityType.DraftProposalComment,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      id: commentId,
      contextId: comment.contextId,
      contextType: DraftCommentContextType.DraftProposal,
      author: accountId,
      message: comment.message,
      replyTo: comment.replyTo,
      likeAccounts: [],
      dislikeAccounts: [],
    };

    await this.dynamodbService.saveItem<CommentModel>(model);

    return model;
  }

  async update(
    params: DraftCommentContextParams,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string> {
    const { daoId, commentId, accountId } = params;
    const draftComment = await this.getComment(params);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.author !== accountId) {
      throw new ForbiddenException('Account is not the author');
    }

    await this.updateDraftProposalCommentInDynamo(
      daoId,
      draftComment.contextId,
      draftComment.id,
      {
        message: draftCommentDto.message,
      },
    );

    return draftComment.id;
  }

  async like(params: DraftCommentContextParams): Promise<boolean> {
    const { daoId, commentId, accountId } = params;
    const draftComment = await this.getComment(params);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.dislikeAccounts?.includes(accountId)) {
      throw new BadRequestException(
        `Draft comment ${commentId} is disliked by ${accountId}`,
      );
    }

    if (!draftComment.likeAccounts.includes(accountId)) {
      const likeAccounts = [...draftComment.likeAccounts, accountId];

      await this.updateDraftProposalCommentInDynamo(
        daoId,
        draftComment.contextId,
        draftComment.id,
        { likeAccounts },
      );

      if (await this.useDynamo()) {
        await this.eventService.sendUpdateDraftCommentEvent({
          ...draftComment,
          likeAccounts,
        });
      }
    }

    return true;
  }

  async removeLike(params: DraftCommentContextParams): Promise<boolean> {
    const { daoId, commentId, accountId } = params;
    const draftComment = await this.getComment(params);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.likeAccounts.includes(accountId)) {
      const likeAccounts = draftComment.likeAccounts.filter(
        (item) => item !== accountId,
      );
      await this.updateDraftProposalCommentInDynamo(
        daoId,
        draftComment.contextId,
        draftComment.id,
        { likeAccounts },
      );

      if (await this.useDynamo()) {
        await this.eventService.sendUpdateDraftCommentEvent({
          ...draftComment,
          likeAccounts,
        });
      }
    }

    return true;
  }

  async dislike(params: DraftCommentContextParams): Promise<boolean> {
    const { daoId, commentId, accountId, draftId } = params;
    const draftComment = await this.getComment(params);

    if (!draftComment) {
      throw new NotFoundException(
        `Draft ${draftId} comment ${commentId} does not exist`,
      );
    }

    if (draftComment.dislikeAccounts.includes(accountId)) {
      throw new BadRequestException(
        `Draft comment ${commentId} is liked by ${accountId}`,
      );
    }

    if (!draftComment.dislikeAccounts?.includes(accountId)) {
      const dislikeAccounts = [...draftComment.dislikeAccounts, accountId];
      await this.updateDraftProposalCommentInDynamo(
        daoId,
        draftComment.contextId,
        draftComment.id,
        { dislikeAccounts },
      );

      if (await this.useDynamo()) {
        await this.eventService.sendUpdateDraftCommentEvent({
          ...draftComment,
          dislikeAccounts,
        });
      }
    }

    return true;
  }

  async removeDislike(params: DraftCommentContextParams): Promise<boolean> {
    const { daoId, commentId, accountId } = params;
    const draftComment = await this.getComment(params);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.dislikeAccounts?.includes(accountId)) {
      const dislikeAccounts = draftComment.dislikeAccounts.filter(
        (item) => item !== accountId,
      );
      await this.updateDraftProposalCommentInDynamo(
        daoId,
        draftComment.contextId,
        draftComment.id,
        { dislikeAccounts },
      );

      if (await this.useDynamo()) {
        await this.eventService.sendUpdateDraftCommentEvent({
          ...draftComment,
          dislikeAccounts,
        });
      }
    }

    return true;
  }

  async delete(params: DraftCommentContextParams): Promise<DeleteResponse> {
    const { daoId, commentId, accountId } = params;
    const draftComment = await this.getComment(params);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    const dao = await this.dynamodbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );

    const accountPermissions = getAccountPermissions(
      dao.policy.roles,
      undefined,
      accountId,
    );

    if (draftComment.author !== accountId && !accountPermissions.isCouncil) {
      throw new ForbiddenException('Account is not the author or council');
    }

    await this.updateDraftProposalCommentInDynamo(
      daoId,
      draftComment.contextId,
      draftComment.id,
      { isArchived: true },
    );

    await this.incrementDraftProposalReplies(daoId, draftComment.contextId, -1);

    if (await this.useDynamo()) {
      await this.eventService.sendDeleteDraftCommentEvent(draftComment);
    }

    return { id: commentId, deleted: true };
  }
}
