import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';

import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  AccountNotificationIdsModel,
  AccountNotificationModel,
  mapAccountNotificationIdsModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';
import { buildEntityId } from '@sputnik-v2/utils';

@Injectable()
export class AccountNotificationIdsDynamoService {
  private readonly logger = new Logger(
    AccountNotificationIdsDynamoService.name,
  );

  constructor(private readonly dynamoDbService: DynamodbService) {}

  async getAccountsNotificationIds(
    accountId: string,
  ): Promise<AccountNotificationIdsModel | null> {
    return this.dynamoDbService.getItemByType<AccountNotificationIdsModel>(
      accountId,
      DynamoEntityType.AccountNotificationIds,
      accountId,
    );
  }

  async readAll(accountId: string) {
    await this.dynamoDbService.updateItem(
      accountId,
      buildEntityId(DynamoEntityType.AccountNotificationIds, accountId),
      {
        notReadIds: [],
      },
    );
  }

  async archiveAll(accountId: string) {
    await this.dynamoDbService.updateItem(
      accountId,
      buildEntityId(DynamoEntityType.AccountNotificationIds, accountId),
      {
        notArchivedIds: [],
      },
    );
  }

  async setAccountsNotificationIds(
    accountNotifications: Partial<AccountNotificationModel>[],
  ) {
    const accountsMap = accountNotifications.reduce(
      (accountsMap, accountNotification) => {
        if (accountsMap[accountNotification.accountId]) {
          accountsMap[accountNotification.accountId].push(accountNotification);
        } else {
          accountsMap[accountNotification.accountId] = [accountNotification];
        }

        return accountsMap;
      },
      {},
    );
    const { errors } = await PromisePool.withConcurrency(5)
      .for(Object.keys(accountsMap))
      .process(async (accountId) => {
        return this.setAccountNotificationIds(
          accountId,
          accountsMap[accountId],
        );
      });

    if (errors.length > 0) {
      errors.forEach((error) => {
        this.logger.error(
          `Failed to set account notification ids for ${error.item} with error: ${error}`,
        );
      });
      throw new Error('Failed to set account notification ids');
    }
  }

  async setAccountNotificationIds(
    accountId: string,
    accountNotifications: Partial<AccountNotificationModel>[],
  ) {
    let model =
      (await this.dynamoDbService.getItemByType<AccountNotificationIdsModel>(
        accountId,
        DynamoEntityType.AccountNotificationIds,
        accountId,
      )) || mapAccountNotificationIdsModel(accountId, [], []);

    for (const accountNotification of accountNotifications) {
      model = this.setAccountNotificationId(model, accountNotification);
    }

    await this.dynamoDbService.saveItem(model, false);
  }

  private setAccountNotificationId(
    item: AccountNotificationIdsModel,
    accountNotification: Partial<AccountNotificationModel>,
  ) {
    let { notReadIds, notArchivedIds } = item;
    const { id, isRead, isArchived } = accountNotification;

    if (isRead) {
      notReadIds = notReadIds.filter((notReadId) => id !== notReadId);
    } else if (!notReadIds.includes(id)) {
      notReadIds.push(id);
    }

    if (isArchived) {
      notArchivedIds = notArchivedIds.filter((notReadId) => id !== notReadId);
    } else if (!notArchivedIds.includes(id)) {
      notArchivedIds.push(id);
    }

    return {
      ...item,
      notReadIds,
      notArchivedIds,
    };
  }
}
