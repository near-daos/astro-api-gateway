import { MongoRepository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  castDraftProposalBasicResponse,
  DraftProposalService,
} from '@sputnik-v2/draft-proposal';
import { DRAFT_DB_CONNECTION, Order } from '@sputnik-v2/common';
import { DraftComment } from './entities';
import {
  castDraftCommentResponse,
  CreateDraftComment,
  DraftCommentsRequest,
} from './dto';
import { DraftCommentContextType } from './types';

@Injectable()
export class DraftCommentService {
  constructor(
    @InjectRepository(DraftComment, DRAFT_DB_CONNECTION)
    private draftCommentRepository: MongoRepository<DraftComment>,
    private draftProposalService: DraftProposalService,
  ) {}

  private async createDraftProposalComment(
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    const draftProposal = await this.draftProposalService.findOne(
      draftCommentDto.contextId,
    );

    if (!draftProposal) {
      throw new NotFoundException(
        `Draft proposal ${draftCommentDto.contextId} does not exist`,
      );
    }

    const draftComment = await this.draftCommentRepository.save({
      contextId: draftCommentDto.contextId,
      contextType: DraftCommentContextType.DraftProposal,
      author: accountId,
      message: draftCommentDto.message,
      likeAccounts: [],
    });
    await this.draftProposalService.updateReplies(
      draftProposal.id,
      await this.draftCommentRepository.count({
        contextId: { $eq: draftComment.contextId },
        contextType: { $eq: draftComment.contextType },
      }),
    );

    return draftComment.id.toString();
  }

  private async createDraftCommentReply(
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    const draftCommentReplied = await this.draftCommentRepository.findOne(
      draftCommentDto.replyTo,
    );

    if (!draftCommentReplied) {
      throw new NotFoundException(
        `Reply comment ${draftCommentDto.replyTo} does not exist`,
      );
    }

    const draftComment = await this.draftCommentRepository.save({
      contextId: draftCommentReplied.contextId,
      contextType: draftCommentReplied.contextType,
      author: accountId,
      message: draftCommentDto.message,
      replyTo: draftCommentDto.replyTo,
      likeAccounts: [],
    });

    if (draftComment.contextType === DraftCommentContextType.DraftProposal) {
      await this.draftProposalService.updateReplies(
        draftComment.contextId,
        await this.draftCommentRepository.count({
          contextId: { $eq: draftComment.contextId },
          contextType: { $eq: draftComment.contextType },
        }),
      );
    }

    return draftComment.id.toString();
  }

  async create(
    accountId: string,
    draftCommentDto: CreateDraftComment,
  ): Promise<string> {
    if (draftCommentDto.replyTo) {
      return this.createDraftCommentReply(accountId, draftCommentDto);
    }

    if (draftCommentDto.contextType === DraftCommentContextType.DraftProposal) {
      return this.createDraftProposalComment(accountId, draftCommentDto);
    }
  }

  async like(id: string, accountId: string): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(id);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (!draftComment.likeAccounts.includes(accountId)) {
      await this.draftCommentRepository.update(draftComment.id, {
        likeAccounts: [...draftComment.likeAccounts, accountId],
      });
    }

    return true;
  }

  async unlike(id: string, accountId: string): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(id);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (draftComment.likeAccounts.includes(accountId)) {
      await this.draftCommentRepository.update(draftComment.id, {
        likeAccounts: draftComment.likeAccounts.filter(
          (item) => item !== accountId,
        ),
      });
    }

    return true;
  }

  async getAll(params: DraftCommentsRequest) {
    const {
      limit = 10,
      offset = 0,
      search,
      orderBy = 'createdAt',
      order = Order.DESC,
      contextId,
      contextType,
      isReply,
    } = params;
    const queries = [];

    if (search) {
      const searchRegExp = new RegExp(search.trim(), 'i');
      queries.push({ message: { $regex: searchRegExp } });
    }

    if (contextId) {
      queries.push({ contextId: { $eq: contextId } });
    }

    if (contextType) {
      queries.push({ contextType: { $eq: contextType } });
    }

    if (typeof isReply === 'boolean') {
      queries.push({
        replyTo: { [isReply ? '$ne' : '$eq']: null },
      });
    }

    const [data, total] = await this.draftCommentRepository.findAndCount({
      where: queries.length ? { $and: queries } : {},
      order: { [orderBy]: order },
      take: limit,
      skip: offset,
    });
    const replies = await this.draftCommentRepository.find({
      where: { replyTo: { $in: data.map(({ id }) => id.toString()) } },
      order: { [orderBy]: order },
    });

    return {
      limit,
      offset,
      total,
      data: data.map((item) => castDraftCommentResponse(item, replies)),
    };
  }
}
