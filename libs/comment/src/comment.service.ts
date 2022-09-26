import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DaoService } from '@sputnik-v2/dao';
import { ProposalService } from '@sputnik-v2/proposal';
import { EventService } from '@sputnik-v2/event';
import { BountyContextService } from '@sputnik-v2/bounty';
import { OpensearchService } from '@sputnik-v2/opensearch';

import { Comment } from './entities';
import { CommentDto } from './dto';
import { CommentContextType } from './types';

@Injectable()
export class CommentService extends TypeOrmCrudService<Comment> {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly proposalService: ProposalService,
    private readonly bountyContextService: BountyContextService,
    private readonly daoService: DaoService,
    private readonly eventService: EventService,
    private readonly opensearchService: OpensearchService,
  ) {
    super(commentRepository);
  }

  async create(accountId: string, commentDto: CommentDto): Promise<Comment> {
    if (commentDto.contextType === CommentContextType.Proposal) {
      const proposal = await this.proposalService.findOne(commentDto.contextId);

      if (!proposal) {
        throw new NotFoundException(
          `Proposal with id ${commentDto.contextId} not found`,
        );
      }

      return this.createDaoComment(accountId, proposal.daoId, commentDto);
    }

    if (commentDto.contextType === CommentContextType.BountyContext) {
      const bountyContext = await this.bountyContextService.findOne(
        commentDto.contextId,
      );

      if (!bountyContext) {
        throw new NotFoundException(
          `Bounty Context with id ${commentDto.contextId} not found`,
        );
      }

      return this.createDaoComment(accountId, bountyContext.daoId, commentDto);
    }
  }

  async updateMultiple(comments: Partial<Comment>[]): Promise<Comment[]> {
    const savedComments = await this.commentRepository.save(comments);

    for (const comment of comments) {
      await this.opensearchService.indexComment(
        `${comment.id}`,
        comment as Comment,
      );
    }

    return savedComments;
  }

  async delete(comment: Comment): Promise<Comment> {
    if (comment.isArchived) {
      return comment;
    }

    const deletedComment = await this.commentRepository.save({
      ...comment,
      isArchived: true,
    });

    await this.opensearchService.indexComment(
      `${comment.id}`,
      await this.commentRepository.findOne(comment.id, {
        loadEagerRelations: false,
      }),
    );

    await this.updateCommentsCount(deletedComment);
    await this.eventService.sendDeleteCommentEvent(deletedComment);

    return deletedComment;
  }

  async deleteById(commentId: string | number): Promise<Comment> {
    const comment = await this.commentRepository.findOne(Number(commentId));

    if (!comment) {
      throw new NotFoundException(
        `Comment with commentId ${commentId} not found`,
      );
    }

    return this.delete(comment);
  }

  async deleteAsOwner(commentId: string, accountId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne(Number(commentId));

    if (!comment) {
      throw new NotFoundException(
        `Comment with commentId ${commentId} not found`,
      );
    }

    const council = await this.daoService.getCouncil(comment.daoId);

    if (comment.accountId !== accountId && !council.includes(accountId)) {
      throw new ForbiddenException(
        `Account ${accountId} is not a comment creator not and not a part of council`,
      );
    }

    return this.delete(comment);
  }

  private async createDaoComment(
    accountId: string,
    daoId: string,
    commentDto: CommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.save({
      ...commentDto,
      accountId,
      daoId,
    });

    await this.opensearchService.indexComment(`${comment.id}`, comment);
    await this.updateCommentsCount(comment);

    await this.eventService.sendNewCommentEvent(comment);

    return comment;
  }
  async updateCommentsCount(comment: Comment) {
    const commentsCount = await this.commentRepository.count({
      contextId: comment.contextId,
      contextType: comment.contextType,
      isArchived: false,
    });

    if (comment.contextType === CommentContextType.Proposal) {
      await this.proposalService.updateCommentsCount(
        comment.contextId,
        commentsCount,
      );
    }

    if (comment.contextType === CommentContextType.BountyContext) {
      await this.bountyContextService.updateCommentsCount(
        comment.contextId,
        commentsCount,
      );
    }
  }
}
