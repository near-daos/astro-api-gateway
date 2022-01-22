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
  ) {
    super(commentRepository);
  }

  async create(commentDto: CommentDto): Promise<Comment> {
    if (commentDto.contextType === CommentContextType.Proposal) {
      const proposal = await this.proposalService.findOne(commentDto.contextId);

      if (!proposal) {
        throw new NotFoundException(
          `Proposal with id ${commentDto.contextId} not found`,
        );
      }

      return this.createDaoComment(proposal.daoId, commentDto);
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

      return this.createDaoComment(bountyContext.daoId, commentDto);
    }
  }

  private async createDaoComment(
    daoId: string,
    commentDto: CommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.save({
      ...commentDto,
      daoId,
    });

    await this.eventService.sendNewCommentEvent(comment);

    return comment;
  }

  async updateMultiple(comments: Partial<Comment>[]): Promise<Comment[]> {
    return this.commentRepository.save(comments);
  }

  async delete(comment: Comment): Promise<Comment> {
    if (comment.isArchived) {
      return comment;
    }

    const deletedComment = await this.commentRepository.save({
      ...comment,
      isArchived: true,
    });

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
}
