import { MongoRepository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoDraftProposalService } from '@sputnik-v2/draft-proposal';
import { DeleteResponse, DRAFT_DB_CONNECTION, Order } from '@sputnik-v2/common';
import { EventService } from '@sputnik-v2/event';
import { DaoApiService } from '@sputnik-v2/dao-api';
import { DraftComment } from './entities';
import {
  castDraftCommentResponse,
  CreateDraftComment,
  DraftCommentsRequest,
  UpdateDraftComment,
} from './dto';
import {
  DraftCommentContextParams,
  DraftCommentContextType,
  DraftCommentService,
} from './types';
import { getAccountPermissions } from '@sputnik-v2/utils';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';

@Injectable()
export class MongoDraftCommentService implements DraftCommentService {
  constructor(
    @InjectRepository(DraftComment, DRAFT_DB_CONNECTION)
    private draftCommentRepository: MongoRepository<DraftComment>,
    private draftProposalService: MongoDraftProposalService,
    private daoApiService: DaoApiService,
    private eventService: EventService,
    private featureFlagsService: FeatureFlagsService,
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
      draftProposal.daoId,
      draftProposal.id,
      await this.draftCommentRepository.count({
        contextId: { $eq: draftComment.contextId },
        contextType: { $eq: draftComment.contextType },
      }),
    );

    if (
      !(await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo))
    ) {
      await this.eventService.sendNewDraftCommentEvent(
        castDraftCommentResponse(draftComment),
      );
    }

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
        draftComment.daoId,
        draftComment.contextId,
        await this.draftCommentRepository.count({
          contextId: { $eq: draftComment.contextId },
          contextType: { $eq: draftComment.contextType },
        }),
      );
    }

    if (
      !(await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo))
    ) {
      await this.eventService.sendNewDraftCommentEvent(
        castDraftCommentResponse(draftComment),
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
    { commentId, accountId }: DraftCommentContextParams,
    draftCommentDto: UpdateDraftComment,
  ): Promise<string> {
    const draftComment = await this.draftCommentRepository.findOne(commentId);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.author !== accountId) {
      throw new ForbiddenException('Account is not the author');
    }

    const updatedComment = await this.draftCommentRepository.save({
      ...draftComment,
      message: draftCommentDto.message,
    });

    if (
      !(await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo))
    ) {
      await this.eventService.sendUpdateDraftCommentEvent(
        castDraftCommentResponse(updatedComment),
      );
    }

    return draftComment.id.toString();
  }

  async like({
    commentId,
    accountId,
  }: DraftCommentContextParams): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(commentId);

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
      await this.draftCommentRepository.update(draftComment.id, {
        likeAccounts,
      });
      if (
        !(await this.featureFlagsService.check(
          FeatureFlags.DraftCommentsDynamo,
        ))
      ) {
        await this.eventService.sendUpdateDraftCommentEvent(
          castDraftCommentResponse({ ...draftComment, likeAccounts }),
        );
      }
    }

    return true;
  }

  async removeLike({
    commentId,
    accountId,
  }: DraftCommentContextParams): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(commentId);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.likeAccounts.includes(accountId)) {
      const likeAccounts = draftComment.likeAccounts.filter(
        (item) => item !== accountId,
      );
      await this.draftCommentRepository.update(draftComment.id, {
        likeAccounts,
      });

      if (
        !(await this.featureFlagsService.check(
          FeatureFlags.DraftCommentsDynamo,
        ))
      ) {
        await this.eventService.sendUpdateDraftCommentEvent(
          castDraftCommentResponse({ ...draftComment, likeAccounts }),
        );
      }
    }

    return true;
  }

  async dislike({
    commentId,
    accountId,
  }: DraftCommentContextParams): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(commentId);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.likeAccounts.includes(accountId)) {
      throw new BadRequestException(
        `Draft comment ${commentId} is liked by ${accountId}`,
      );
    }

    if (!draftComment.dislikeAccounts?.includes(accountId)) {
      const dislikeAccounts = [...draftComment.dislikeAccounts, accountId];
      await this.draftCommentRepository.update(draftComment.id, {
        dislikeAccounts,
      });
      if (
        !(await this.featureFlagsService.check(
          FeatureFlags.DraftCommentsDynamo,
        ))
      ) {
        await this.eventService.sendUpdateDraftCommentEvent(
          castDraftCommentResponse({ ...draftComment, dislikeAccounts }),
        );
      }
    }

    return true;
  }

  async removeDislike({
    commentId,
    accountId,
  }: DraftCommentContextParams): Promise<boolean> {
    const draftComment = await this.draftCommentRepository.findOne(commentId);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    if (draftComment.dislikeAccounts?.includes(accountId)) {
      const dislikeAccounts = draftComment.dislikeAccounts.filter(
        (item) => item !== accountId,
      );
      await this.draftCommentRepository.update(draftComment.id, {
        dislikeAccounts,
      });
      if (
        !(await this.featureFlagsService.check(
          FeatureFlags.DraftCommentsDynamo,
        ))
      ) {
        await this.eventService.sendUpdateDraftCommentEvent(
          castDraftCommentResponse({ ...draftComment, dislikeAccounts }),
        );
      }
    }

    return true;
  }

  async delete({
    commentId,
    accountId,
  }: DraftCommentContextParams): Promise<DeleteResponse> {
    const draftComment = await this.draftCommentRepository.findOne(commentId);

    if (!draftComment) {
      throw new NotFoundException(`Draft comment ${commentId} does not exist`);
    }

    const { data: dao } = await this.daoApiService.getDao(draftComment.daoId);
    const accountPermissions = getAccountPermissions(
      dao.policy.roles,
      undefined,
      accountId,
    );

    if (draftComment.author !== accountId && !accountPermissions.isCouncil) {
      throw new ForbiddenException('Account is not the author or council');
    }

    const replies = await this.draftCommentRepository.find({
      where: { replyTo: commentId },
      select: ['id'],
    });

    // Remove comment and all the replies
    await this.draftCommentRepository.delete([
      draftComment.id,
      ...replies.map(({ id }) => id),
    ]);

    if (draftComment.contextType === DraftCommentContextType.DraftProposal) {
      await this.draftProposalService.updateReplies(
        draftComment.daoId,
        draftComment.contextId,
        await this.draftCommentRepository.count({
          contextId: { $eq: draftComment.contextId },
          contextType: { $eq: draftComment.contextType },
        }),
      );
    }

    if (
      !(await this.featureFlagsService.check(FeatureFlags.DraftCommentsDynamo))
    ) {
      await this.eventService.sendDeleteDraftCommentEvent(
        castDraftCommentResponse(draftComment),
      );
    }

    return { id: commentId, deleted: true };
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
