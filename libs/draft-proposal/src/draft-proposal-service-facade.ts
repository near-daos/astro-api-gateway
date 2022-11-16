import {
  CloseDraftProposal,
  CreateDraftProposal,
  DraftProposalBasicResponse,
  DraftProposalRequest,
  DraftProposalResponse,
  UpdateDraftProposal,
} from '@sputnik-v2/draft-proposal/dto';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';
import { MongoDraftProposalService } from '@sputnik-v2/draft-proposal/mongo-draft-proposal.service';
import { DynamoDraftProposalService } from '@sputnik-v2/draft-proposal/dynamo-draft-proposal.service';
import { DraftProposalService } from '@sputnik-v2/draft-proposal/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DraftProposalServiceFacade implements DraftProposalService {
  constructor(
    private readonly mongoDraftProposalService: MongoDraftProposalService,
    private readonly dynamoDraftProposalService: DynamoDraftProposalService,
  ) {}

  async close(
    daoId: string,
    id: string,
    accountId: string,
    closeDraftProposalDto: CloseDraftProposal,
  ): Promise<boolean> {
    await this.dynamoDraftProposalService.close(
      daoId,
      id,
      accountId,
      closeDraftProposalDto,
    );

    return this.mongoDraftProposalService.close(
      daoId,
      id,
      accountId,
      closeDraftProposalDto,
    );
  }

  async closeInternal(
    daoId: string,
    id: string,
    proposalId: string,
  ): Promise<void> {
    await this.dynamoDraftProposalService.closeInternal(daoId, id, proposalId);

    return this.mongoDraftProposalService.closeInternal(daoId, id, proposalId);
  }

  async create(
    accountId: string,
    draftProposalDto: CreateDraftProposal,
  ): Promise<string> {
    const draftId = await this.mongoDraftProposalService.create(
      accountId,
      draftProposalDto,
    );
    await this.dynamoDraftProposalService.create(
      accountId,
      draftProposalDto,
      draftId,
    );
    return draftId;
  }

  async delete(
    daoId: string,
    id: string,
    accountId: string,
  ): Promise<DeleteResponse> {
    await this.dynamoDraftProposalService.delete(daoId, id, accountId);
    return this.mongoDraftProposalService.delete(daoId, id, accountId);
  }

  getAll(params: any): Promise<BaseResponseDto<DraftProposalBasicResponse>> {
    return this.mongoDraftProposalService.getAll(params);
  }

  getOneById(
    id: string,
    query: DraftProposalRequest,
  ): Promise<DraftProposalResponse> {
    return this.mongoDraftProposalService.getOneById(id, query);
  }

  async removeSave(
    daoId: string,
    id: string,
    accountId: string,
  ): Promise<boolean> {
    await this.dynamoDraftProposalService.removeSave(daoId, id, accountId);
    return this.mongoDraftProposalService.removeSave(daoId, id, accountId);
  }

  async save(daoId: string, id: string, accountId: string): Promise<boolean> {
    await this.dynamoDraftProposalService.save(daoId, id, accountId);
    return this.mongoDraftProposalService.save(daoId, id, accountId);
  }

  async update(
    daoId: string,
    id: string,
    accountId: string,
    draftProposalDto: UpdateDraftProposal,
  ): Promise<string> {
    await this.dynamoDraftProposalService.update(
      daoId,
      id,
      accountId,
      draftProposalDto,
    );

    return this.mongoDraftProposalService.update(
      daoId,
      id,
      accountId,
      draftProposalDto,
    );
  }

  async view(daoId: string, id: string, accountId: string): Promise<boolean> {
    await this.dynamoDraftProposalService.view(daoId, id, accountId);
    return this.mongoDraftProposalService.view(daoId, id, accountId);
  }
}
