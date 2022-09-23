import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BaseResponseDto,
  DeleteResponse,
  DRAFT_DB_CONNECTION,
  Order,
} from '@sputnik-v2/common';
import { ProposalKind } from '@sputnik-v2/proposal';
import { DaoApiService } from '@sputnik-v2/dao-api';
import { getAccountPermissions } from '@sputnik-v2/utils';

import { DraftProposal, DraftProposalHistory } from './entities';
import {
  castDraftProposalBasicResponse,
  castDraftProposalResponse,
  CloseDraftProposal,
  CreateDraftProposal,
  DraftProposalBasicResponse,
  DraftProposalRequest,
  DraftProposalResponse,
  DraftProposalsRequest,
  UpdateDraftProposal,
} from './dto';
import { DraftProposalState } from './types';

@Injectable()
export class DraftProposalService {
  constructor(
    @InjectRepository(DraftProposal, DRAFT_DB_CONNECTION)
    private draftProposalRepository: MongoRepository<DraftProposal>,
    @InjectRepository(DraftProposalHistory, DRAFT_DB_CONNECTION)
    private draftProposalHistoryRepository: MongoRepository<DraftProposalHistory>,
    private daoApiService: DaoApiService,
  ) {}

  async create(
    accountId: string,
    draftProposalDto: CreateDraftProposal,
  ): Promise<string> {
    const draftProposal = await this.draftProposalRepository.save({
      daoId: draftProposalDto.daoId,
      proposer: accountId,
      title: draftProposalDto.title,
      description: draftProposalDto.description,
      kind: draftProposalDto.kind as ProposalKind,
      type: draftProposalDto.type,
      state: DraftProposalState.Open,
      replies: 0,
      viewAccounts: [],
      saveAccounts: [],
    });
    return draftProposal.id.toString();
  }

  async update(
    id: string,
    accountId: string,
    draftProposalDto: UpdateDraftProposal,
  ) {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    const { data: dao } = await this.daoApiService.getDao(draftProposal.daoId);
    const accountPermissions = getAccountPermissions(
      dao.policy.roles,
      draftProposalDto.type,
      accountId,
    );

    if (draftProposal.proposer !== accountId && !accountPermissions.isCouncil) {
      throw new ForbiddenException('Account is not the proposer or council');
    }

    await this.draftProposalHistoryRepository.save({
      draftProposalId: draftProposal.id,
      daoId: draftProposal.daoId,
      proposer: draftProposal.proposer,
      title: draftProposal.title,
      description: draftProposal.description,
      kind: draftProposal.kind,
      type: draftProposal.type,
      date: draftProposal.updatedAt,
    });
    await this.draftProposalRepository.save({
      ...draftProposal,
      title: draftProposalDto.title,
      description: draftProposalDto.description,
      kind: draftProposalDto.kind as ProposalKind,
      type: draftProposalDto.type,
    });

    return draftProposal.id.toString();
  }

  async delete(id: string, accountId: string): Promise<DeleteResponse> {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    const { data: dao } = await this.daoApiService.getDao(draftProposal.daoId);
    const accountPermissions = getAccountPermissions(
      dao.policy.roles,
      draftProposal.type,
      accountId,
    );

    if (draftProposal.proposer !== accountId && !accountPermissions.isCouncil) {
      throw new ForbiddenException('Account is not the proposer or council');
    }

    if (draftProposal.state === DraftProposalState.Closed) {
      throw new BadRequestException(`Draft proposal is closed`);
    }

    await this.draftProposalHistoryRepository.deleteMany({
      draftProposalId: { $eq: draftProposal.id },
    });
    await this.draftProposalRepository.delete(draftProposal);
    return {
      id,
      deleted: true,
    };
  }

  async view(id: string, accountId: string): Promise<boolean> {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    if (!draftProposal.viewAccounts.includes(accountId)) {
      await this.draftProposalRepository.update(draftProposal.id, {
        viewAccounts: [...draftProposal.viewAccounts, accountId],
      });
    }

    return true;
  }

  async save(id: string, accountId: string): Promise<boolean> {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    if (!draftProposal.saveAccounts.includes(accountId)) {
      await this.draftProposalRepository.update(draftProposal.id, {
        saveAccounts: [...draftProposal.saveAccounts, accountId],
      });
    }

    return true;
  }

  async removeSave(id: string, accountId: string): Promise<boolean> {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    if (draftProposal.saveAccounts.includes(accountId)) {
      await this.draftProposalRepository.update(draftProposal.id, {
        saveAccounts: draftProposal.saveAccounts.filter(
          (item) => item !== accountId,
        ),
      });
    }

    return true;
  }

  async close(
    id: string,
    accountId: string,
    closeDraftProposalDto: CloseDraftProposal,
  ): Promise<boolean> {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    const { data: dao } = await this.daoApiService.getDao(draftProposal.daoId);
    const accountPermissions = getAccountPermissions(
      dao.policy.roles,
      draftProposal.type,
      accountId,
    );

    if (!accountPermissions.canAdd) {
      throw new ForbiddenException(
        `Account does not have permissions to add ${draftProposal.type} proposals`,
      );
    }

    if (draftProposal.state !== DraftProposalState.Closed) {
      await this.draftProposalRepository.update(draftProposal.id, {
        state: DraftProposalState.Closed,
        proposalId: closeDraftProposalDto.proposalId,
      });
    }

    return true;
  }

  async closeInternal(id: string, proposalId: string) {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (draftProposal) {
      await this.draftProposalRepository.update(draftProposal.id, {
        state: DraftProposalState.Closed,
        proposalId,
      });
    }
  }

  async updateReplies(id: string, replies: number): Promise<void> {
    await this.draftProposalRepository.update(id, {
      replies,
    });
  }

  async getAll(
    params: DraftProposalsRequest,
  ): Promise<BaseResponseDto<DraftProposalBasicResponse>> {
    const {
      limit = 10,
      offset = 0,
      accountId,
      search,
      orderBy = 'createdAt',
      order = Order.DESC,
      daoId,
      type,
      state,
      isRead,
      isSaved,
    } = params;
    const queries = [];

    if (search) {
      const searchRegExp = new RegExp(search.trim(), 'i');
      queries.push({
        $or: [
          { title: { $regex: searchRegExp } },
          { description: { $regex: searchRegExp } },
        ],
      });
    }

    if (daoId) {
      queries.push({ daoId: { $eq: daoId } });
    }

    if (type) {
      queries.push({ type: { $in: type.split(',') } });
    }

    if (state) {
      queries.push({ state: { $eq: state } });
    }

    if (accountId && typeof isRead === 'boolean') {
      queries.push({
        viewAccounts: { [isRead ? '$in' : '$nin']: [accountId] },
      });
    }

    if (accountId && typeof isSaved === 'boolean') {
      queries.push({
        saveAccounts: { [isSaved ? '$in' : '$nin']: [accountId] },
      });
    }

    const [data, total] = await this.draftProposalRepository.findAndCount({
      where: queries.length ? { $and: queries } : {},
      order: { [orderBy]: order },
      take: limit,
      skip: offset,
    });
    return {
      limit,
      offset,
      total,
      data: data.map((item) => castDraftProposalBasicResponse(item, accountId)),
    };
  }

  async getOneById(
    id: string,
    params: DraftProposalRequest,
  ): Promise<DraftProposalResponse> {
    const draftProposal = await this.draftProposalRepository.findOne(id);

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    const history = await this.draftProposalHistoryRepository.find({
      where: { draftProposalId: { $eq: draftProposal.id } },
      order: { createdAt: 'DESC' },
    });

    return castDraftProposalResponse(draftProposal, history, params.accountId);
  }

  async findOne(id: string): Promise<DraftProposal | undefined> {
    return this.draftProposalRepository.findOne(id);
  }
}
