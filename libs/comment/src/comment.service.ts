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

import { Comment } from './entities';
import { CommentDto } from './dto';

@Injectable()
export class CommentService extends TypeOrmCrudService<Comment> {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly proposalService: ProposalService,
    private readonly daoService: DaoService,
    private readonly eventService: EventService,
  ) {
    super(commentRepository);
  }

  async create(commentDto: CommentDto): Promise<Comment> {
    const proposal = await this.proposalService.findOne(commentDto.proposalId);

    if (!proposal) {
      throw new NotFoundException(
        `Proposal with proposalId ${commentDto.proposalId} not found`,
      );
    }
    const comment = await this.commentRepository.save({
      proposalId: commentDto.proposalId,
      accountId: commentDto.accountId,
      message: commentDto.message,
      daoId: proposal.daoId,
    });

    await this.proposalService.update({
      ...proposal,
      commentsCount: proposal.commentsCount + 1,
    });
    await this.eventService.sendNewCommentEvent(comment);

    return comment;
  }

  async delete(comment: Comment): Promise<Comment> {
    const proposal = await this.proposalService.findOne(comment.proposalId);

    if (comment.isArchived) {
      return comment;
    }

    await this.proposalService.update({
      ...proposal,
      commentsCount: proposal.commentsCount - 1,
    });

    return this.commentRepository.save({
      ...comment,
      isArchived: true,
    });
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
