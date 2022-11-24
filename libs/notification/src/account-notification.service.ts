import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  AccountNotificationModel,
  mapAccountNotificationToAccountNotificationModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import { FeatureFlagsService } from '@sputnik-v2/feature-flags/feature-flags.service';
import { FeatureFlags } from '@sputnik-v2/feature-flags/types';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import { buildEntityId } from '@sputnik-v2/utils';

import {
  AccountNotificationDto,
  NotificationStatusResponse,
  UpdateAccountNotificationDto,
} from './dto';
import { AccountNotification } from './entities';
import { AccountNotificationIdsDynamoService } from './account-notification-ids-dynamo.service';

@Injectable()
export class AccountNotificationService extends TypeOrmCrudService<AccountNotification> {
  constructor(
    @InjectRepository(AccountNotification)
    private readonly accountNotificationRepository: Repository<AccountNotification>,
    private readonly dynamoDbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly accountNotificationIdsDynamoService: AccountNotificationIdsDynamoService,
  ) {
    super(accountNotificationRepository);
  }

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.NotificationDynamo);
  }

  async createMultiple(
    accountNotificationsDto: AccountNotificationDto[],
  ): Promise<AccountNotification[]> {
    const models = accountNotificationsDto.map((accountNotification) =>
      mapAccountNotificationToAccountNotificationModel(accountNotification),
    );
    await this.dynamoDbService.batchPutChunked(models);
    await this.accountNotificationIdsDynamoService.setAccountsNotificationIds(
      models,
    );
    return this.accountNotificationRepository.save(accountNotificationsDto);
  }

  async findById(
    accountId: string,
    id: string,
  ): Promise<AccountNotification | AccountNotificationModel> {
    if (await this.useDynamoDB()) {
      return this.dynamoDbService.getItemByType<AccountNotificationModel>(
        accountId,
        DynamoEntityType.AccountNotification,
        id,
      );
    } else {
      return this.accountNotificationRepository.findOne(id);
    }
  }

  async updateAccountNotification(
    accountId: string,
    id: string,
    updateDto: UpdateAccountNotificationDto,
  ): Promise<AccountNotification> {
    const accountNotification = await this.findById(accountId, id);

    if (!accountNotification) {
      throw new BadRequestException(`Invalid Account Notification ID ${id}`);
    }

    const updatedModel = {
      ...mapAccountNotificationToAccountNotificationModel(accountNotification),
      isMuted: updateDto.isMuted,
      isRead: updateDto.isRead,
      isArchived: updateDto.isArchived,
    };
    await this.dynamoDbService.saveItem<AccountNotificationModel>(
      updatedModel,
      false,
    );
    await this.accountNotificationIdsDynamoService.setAccountNotificationIds(
      updatedModel.partitionId,
      [updatedModel],
    );
    return this.accountNotificationRepository.save({
      ...accountNotification,
      isMuted: updateDto.isMuted,
      isRead: updateDto.isRead,
      isArchived: updateDto.isArchived,
    });
  }

  async readAccountNotifications(accountId: string): Promise<UpdateResult> {
    const accountNotificationIds =
      await this.accountNotificationIdsDynamoService.getAccountsNotificationIds(
        accountId,
      );

    if (accountNotificationIds) {
      for (const id of accountNotificationIds.notReadIds) {
        await this.dynamoDbService.updateItem(
          accountId,
          buildEntityId(DynamoEntityType.AccountNotification, id),
          { isRead: true },
        );
        await this.accountNotificationIdsDynamoService.readAll(accountId);
      }
    }

    return this.accountNotificationRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where({
        accountId,
        isRead: false,
      })
      .execute();
  }

  async archiveAccountNotifications(accountId: string): Promise<UpdateResult> {
    const accountNotificationIds =
      await this.accountNotificationIdsDynamoService.getAccountsNotificationIds(
        accountId,
      );

    if (accountNotificationIds) {
      for (const id of accountNotificationIds.notReadIds) {
        await this.dynamoDbService.updateItem(
          accountId,
          buildEntityId(DynamoEntityType.AccountNotification, id),
          { isArchived: true },
        );
        await this.accountNotificationIdsDynamoService.archiveAll(accountId);
      }
    }

    return this.accountNotificationRepository
      .createQueryBuilder()
      .update()
      .set({ isArchived: true })
      .where({
        accountId,
        isArchived: false,
      })
      .execute();
  }

  async getAccountNotificationStatus(
    accountId: string,
  ): Promise<NotificationStatusResponse> {
    const unreadCount = await this.accountNotificationRepository
      .createQueryBuilder()
      .where({
        accountId,
        isRead: false,
      })
      .getCount();
    return {
      accountId,
      unreadCount,
    };
  }
}
