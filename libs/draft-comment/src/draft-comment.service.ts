import { MongoRepository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DraftProposalService } from '@sputnik-v2/draft-proposal';
import { DeleteResponse, DRAFT_DB_CONNECTION, Order } from '@sputnik-v2/common';
import { ProposalService } from '@sputnik-v2/proposal';
import { DraftComment } from './entities';
import {
  castDraftCommentResponse,
  CreateDraftComment,
  DraftCommentsRequest,
  UpdateDraftComment,
} from './dto';
import { DraftCommentContextType } from './types';

@Injectable()
export class DraftCommentService {
  constructor(
    @InjectRepository(DraftComment, DRAFT_DB_CONNECTION)
    private draftCommentRepository: MongoRepository<DraftComment>,
    private draftProposalService: DraftProposalService,
    private proposalService: ProposalService,
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
      daoId: draftProposal.daoId,
      contextId: draftCommentDto.contextId,
      contextType: DraftCommentContextType.DraftProposal,
      author: accountId,
      message: draftCommentDto.message,
      likeAccounts: [],
      dislikeAccounts: [],
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
      daoId: draftCommentReplied.daoId,
      contextId: draftCommentReplied.contextId,
      contextType: draftCommentReplied.contextType,
      author: accountId,
      message: draftCommentDto.message,
      replyTo: draftCommentDto.replyTo,
      likeAccounts: [],
      dislikeAccounts: [],
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

  async update(
    id: string,
    accountId: string,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string> {
    const draftComment = await this.draftCommentRepository.findOne(id);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (draftComment.author !== accountId) {
      throw new ForbiddenException('Account is not the author');
    }

    await this.draftCommentRepository.save({
      ...draftComment,
      message: draftCommentDto.message,
    });

    return draftComment.id.toString();
  }

  async like(id: string, accountId: string): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(id);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (draftComment.dislikeAccounts?.includes(accountId)) {
      throw new BadRequestException(
        `Draft comment ${id} is disliked by ${accountId}`,
      );
    }

    if (!draftComment.likeAccounts.includes(accountId)) {
      await this.draftCommentRepository.update(draftComment.id, {
        likeAccounts: [...draftComment.likeAccounts, accountId],
      });
    }

    return true;
  }

  async removeLike(id: string, accountId: string): Promise<boolean> {
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

  async dislike(id: string, accountId: string): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(id);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (draftComment.likeAccounts.includes(accountId)) {
      throw new BadRequestException(
        `Draft comment ${id} is liked by ${accountId}`,
      );
    }

    if (!draftComment.dislikeAccounts?.includes(accountId)) {
      await this.draftCommentRepository.update(draftComment.id, {
        dislikeAccounts: [...draftComment.dislikeAccounts, accountId],
      });
    }

    return true;
  }

  async removeDislike(id: string, accountId: string): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(id);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    if (draftComment.dislikeAccounts?.includes(accountId)) {
      await this.draftCommentRepository.update(draftComment.id, {
        dislikeAccounts: draftComment.dislikeAccounts.filter(
          (item) => item !== accountId,
        ),
      });
    }

    return true;
  }

  async delete(id: string, accountId: string): Promise<DeleteResponse> {
    const draftComment = await this.draftCommentRepository.findOne(id);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${id} does not exist`);
    }

    const accountPermissions =
      await this.proposalService.getAccountPermissionByDao(
        draftComment.daoId,
        accountId,
      );

    if (draftComment.author !== accountId && !accountPermissions.isCouncil) {
      throw new ForbiddenException('Account is not the author or council');
    }

    await this.draftCommentRepository.delete(draftComment);
    return { id, deleted: true };
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
