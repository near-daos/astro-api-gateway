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
  DynamodbService,
  DynamoEntityType,
} from '@sputnik-v2/dynamodb';
import {
  CreateDraftComment,
  DraftCommentResponse,
  DraftCommentsRequest,
  UpdateDraftComment,
} from '@sputnik-v2/draft-comment/dto';
import { CommentContextType } from '@sputnik-v2/comment';
import {
  DraftCommentContextType,
  DraftCommentService,
} from '@sputnik-v2/draft-comment/types';
import { randomUUID } from 'crypto';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';

@Injectable()
export class DynamoDraftCommentService implements DraftCommentService {
  constructor(
    private eventService: EventService,
    private dynamodbService: DynamodbService,
  ) {}

  getAll(
    params: DraftCommentsRequest,
  ): Promise<BaseResponseDto<DraftCommentResponse>> {
    throw new Error('Method not implemented.');
  }

  private async createDraftProposalComment(
    daoId: string,
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    const commentId = randomUUID();

    const comment = await this.createDraftProposalCommentInDynamo(
      daoId,
      accountId,
      commentId,
      draftCommentDto,
    );

    await this.dynamodbService.updateDraftProposalReplies(
      daoId,
      draftCommentDto.contextId,
      1,
    );

    await this.eventService.sendNewDraftCommentEvent(comment);

    return commentId;
  }

  private async createDraftCommentReply(
    daoId: string,
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    const reply = await this.createDraftProposalCommentInDynamo(
      daoId,
      accountId,
      randomUUID(),
      draftCommentDto,
    );

    await this.dynamodbService.updateDraftProposalReplies(
      daoId,
      draftCommentDto.contextId,
      1,
    );

    await this.eventService.sendNewDraftCommentEvent(reply);

    return reply.id;
  }

  create(
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    if (draftCommentDto.replyTo) {
      return this.createDraftCommentReply(
        draftCommentDto.daoId,
        accountId,
        draftCommentDto,
      );
    }

    if (draftCommentDto.contextType === DraftCommentContextType.DraftProposal) {
      return this.createDraftProposalComment(
        draftCommentDto.daoId,
        accountId,
        draftCommentDto,
      );
    }
  }

  private async updateDraftProposalCommentInDynamo(
    daoId: string,
    draftId: string,
    commentId: string,
    comment: Partial<CommentModel>,
  ) {
    await this.dynamodbService.saveItem<CommentModel>({
      partitionId: daoId,
      entityId: `${DynamoEntityType.DraftProposalComment}:${draftId}:${commentId}`,
      ...comment,
    });
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
      processingTimeStamp: Date.now(),
      id: commentId,
      contextId: comment.contextId,
      contextType: CommentContextType.Proposal,
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
    daoId: string,
    id: string,
    accountId: string,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string> {
    const draftComment = await this.dynamodbService.getItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      id,
    );

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
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

  async like(daoId: string, id: string, accountId: string): Promise<boolean> {
    const draftComment = await this.dynamodbService.getItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      id,
    );

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (draftComment.dislikeAccounts?.includes(accountId)) {
      throw new BadRequestException(
        `Draft comment ${id} is disliked by ${accountId}`,
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

      await this.eventService.sendUpdateDraftCommentEvent({
        ...draftComment,
        likeAccounts,
      });
    }

    return true;
  }

  async removeLike(
    daoId: string,
    id: string,
    accountId: string,
  ): Promise<boolean> {
    const draftComment = await this.dynamodbService.getItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      id,
    );

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
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

      await this.eventService.sendUpdateDraftCommentEvent({
        ...draftComment,
        likeAccounts,
      });
    }

    return true;
  }

  async dislike(
    daoId: string,
    id: string,
    accountId: string,
  ): Promise<boolean> {
    const draftComment = await this.dynamodbService.getItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      id,
    );

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (draftComment.likeAccounts.includes(accountId)) {
      throw new BadRequestException(
        `Draft comment ${id} is liked by ${accountId}`,
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

      await this.eventService.sendUpdateDraftCommentEvent({
        ...draftComment,
        dislikeAccounts,
      });
    }

    return true;
  }

  async removeDislike(
    daoId: string,
    id: string,
    accountId: string,
  ): Promise<boolean> {
    const draftComment = await this.dynamodbService.getItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      id,
    );

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
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
      await this.eventService.sendUpdateDraftCommentEvent({
        ...draftComment,
        dislikeAccounts,
      });
    }

    return true;
  }

  async delete(
    daoId: string,
    commentId: string,
    accountId: string,
  ): Promise<DeleteResponse> {
    const draftComment = await this.dynamodbService.getItemByType<CommentModel>(
      daoId,
      DynamoEntityType.DraftProposalComment,
      commentId,
    );

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    const dao = await this.dynamodbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );

    // const accountPermissions = getAccountPermissions(
    //   dao.policy.roles,
    //   undefined,
    //   accountId,
    // );

    //if (draftComment.author !== accountId && !accountPermissions.isCouncil) {

    if (draftComment.author !== accountId) {
      throw new ForbiddenException('Account is not the author or council');
    }

    await this.updateDraftProposalCommentInDynamo(
      daoId,
      draftComment.contextId,
      draftComment.id,
      { isArchived: true },
    );

    await this.eventService.sendDeleteDraftCommentEvent(draftComment);

    return { id: commentId, deleted: true };
  }
}
