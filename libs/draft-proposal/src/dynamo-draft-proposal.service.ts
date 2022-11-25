import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseResponseDto, DeleteResponse } from '@sputnik-v2/common';
import { ProposalKind } from '@sputnik-v2/proposal';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import { DaoModel, DraftProposalModel } from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

import {
  CloseDraftProposal,
  CreateDraftProposal,
  DraftProposalBasicResponse,
  DraftProposalResponse,
  UpdateDraftProposal,
} from './dto';
import { DraftProposalService, DraftProposalState } from './types';
import { buildEntityId, getAccountPermissions } from '@sputnik-v2/utils';

@Injectable()
export class DynamoDraftProposalService implements DraftProposalService {
  constructor(private dynamodbService: DynamodbService) {}

  getAll(): Promise<BaseResponseDto<DraftProposalBasicResponse>> {
    throw new Error('Method not implemented.');
  }
  getOneById(): Promise<DraftProposalResponse> {
    throw new Error('Method not implemented.');
  }

  async create(
    accountId: string,
    draftProposalDto: CreateDraftProposal,
    draftId: string,
  ): Promise<string> {
    await this.dynamodbService.saveItem<DraftProposalModel>({
      partitionId: draftProposalDto.daoId,
      entityId: buildEntityId(DynamoEntityType.DraftProposal, draftId),
      entityType: DynamoEntityType.DraftProposal,
      id: draftId,
      proposer: accountId,
      title: draftProposalDto.title,
      description: draftProposalDto.description,
      kind: draftProposalDto.kind as ProposalKind,
      type: draftProposalDto.type,
      state: DraftProposalState.Open,
      createTimestamp: Date.now(),
      replies: 0,
      viewAccounts: [],
      saveAccounts: [],
      history: [],
    });

    return draftId;
  }

  async update(
    daoId: string,
    id: string,
    accountId: string,
    draftProposalDto: UpdateDraftProposal,
  ) {
    const draftProposal =
      await this.dynamodbService.getItemByType<DraftProposalModel>(
        daoId,
        DynamoEntityType.DraftProposal,
        id,
      );

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    const dao = await this.dynamodbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );

    const accountPermissions = getAccountPermissions(
      dao.policy.roles,
      draftProposalDto.type,
      accountId,
    );

    if (draftProposal.proposer !== accountId && !accountPermissions.isCouncil) {
      throw new ForbiddenException('Account is not the proposer or council');
    }

    await this.dynamodbService.saveItem<DraftProposalModel>({
      ...draftProposal,
      title: draftProposalDto.title,
      description: draftProposalDto.description,
      kind: draftProposalDto.kind,
      type: draftProposalDto.type,
      history: [
        ...draftProposal.history,
        {
          ...draftProposal,
          daoId: draftProposal.partitionId,
          timestamp: Date.now(),
        },
      ],
    });

    return draftProposal.id;
  }

  async delete(
    daoId: string,
    id: string,
    accountId: string,
  ): Promise<DeleteResponse> {
    const draftProposal =
      await this.dynamodbService.getItemByType<DraftProposalModel>(
        daoId,
        DynamoEntityType.DraftProposal,
        id,
      );

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    const dao = await this.dynamodbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );

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

    await this.dynamodbService.saveItem({
      ...draftProposal,
      updateTimestamp: Date.now(),
      isArchived: true,
    });

    return {
      id,
      deleted: true,
    };
  }

  async view(daoId: string, id: string, accountId: string): Promise<boolean> {
    const draftProposal =
      await this.dynamodbService.getItemByType<DraftProposalModel>(
        daoId,
        DynamoEntityType.DraftProposal,
        id,
      );

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    if (!draftProposal.viewAccounts.includes(accountId)) {
      const viewAccounts = [...draftProposal.viewAccounts, accountId];
      await this.dynamodbService.saveItem<DraftProposalModel>({
        ...draftProposal,
        viewAccounts,
      });
    }

    return true;
  }

  async save(daoId: string, id: string, accountId: string): Promise<boolean> {
    const draftProposal =
      await this.dynamodbService.getItemByType<DraftProposalModel>(
        daoId,
        DynamoEntityType.DraftProposal,
        id,
      );

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    if (!draftProposal.saveAccounts.includes(accountId)) {
      const saveAccounts = [...draftProposal.saveAccounts, accountId];

      await this.dynamodbService.saveItem({
        ...draftProposal,
        saveAccounts,
        updateTimestamp: Date.now(),
      });
    }

    return true;
  }

  async removeSave(
    daoId: string,
    id: string,
    accountId: string,
  ): Promise<boolean> {
    const draftProposal =
      await this.dynamodbService.getItemByType<DraftProposalModel>(
        daoId,
        DynamoEntityType.DraftProposal,
        id,
      );

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    if (draftProposal.saveAccounts.includes(accountId)) {
      const saveAccounts = draftProposal.saveAccounts.filter(
        (item) => item !== accountId,
      );
      await this.dynamodbService.saveItem({
        ...draftProposal,
        saveAccounts,
        updateTimestamp: Date.now(),
      });
    }

    return true;
  }

  async close(
    daoId: string,
    id: string,
    accountId: string,
    closeDraftProposalDto: CloseDraftProposal,
  ): Promise<boolean> {
    const draftProposal =
      await this.dynamodbService.getItemByType<DraftProposalModel>(
        daoId,
        DynamoEntityType.DraftProposal,
        id,
      );

    if (!draftProposal) {
      throw new NotFoundException(`Draft proposal ${id} does not exist`);
    }

    const dao = await this.dynamodbService.getItemByType<DaoModel>(
      daoId,
      DynamoEntityType.Dao,
      daoId,
    );

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
      await this.dynamodbService.saveItem({
        ...draftProposal,
        state: DraftProposalState.Closed,
        proposalId: closeDraftProposalDto.proposalId,
        updateTimestamp: Date.now(),
      });
    }

    return true;
  }

  async closeInternal(daoId: string, id: string, proposalId: string) {
    const draftProposal =
      await this.dynamodbService.getItemByType<DraftProposalModel>(
        daoId,
        DynamoEntityType.DraftProposal,
        id,
      );

    if (draftProposal) {
      await this.dynamodbService.saveItem({
        ...draftProposal,
        state: DraftProposalState.Closed,
        proposalId,
        updateTimestamp: Date.now(),
      });
    }
  }
}
