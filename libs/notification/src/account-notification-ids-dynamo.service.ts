import { Injectable, Logger } from '@nestjs/common';
import PromisePool from '@supercharge/promise-pool';

import { DynamodbService } from '@sputnik-v2/dynamodb/dynamodb.service';
import {
  AccountNotificationIdsModel,
  AccountNotificationModel,
  mapAccountNotificationIdsModel,
} from '@sputnik-v2/dynamodb/models';
import { DynamoEntityType, PartialEntity } from '@sputnik-v2/dynamodb/types';

@Injectable()
export class AccountNotificationIdsDynamoService {
  private readonly logger = new Logger(
    AccountNotificationIdsDynamoService.name,
  );

  constructor(private readonly dynamoDbService: DynamodbService) {}

  async getAccountsNotificationIds(
    accountId: string,
  ): Promise<PartialEntity<AccountNotificationIdsModel> | undefined> {
    return this.dynamoDbService.getItemByType<AccountNotificationIdsModel>(
      accountId,
      DynamoEntityType.AccountNotificationIds,
      accountId,
    );
  }

  async readAll(accountId: string) {
    await this.dynamoDbService.updateItemByType<AccountNotificationIdsModel>(
      accountId,
      DynamoEntityType.AccountNotificationIds,
      accountId,
      {
        notReadIds: [],
      },
    );
  }

  async archiveAll(accountId: string) {
    await this.dynamoDbService.updateItemByType<AccountNotificationIdsModel>(
      accountId,
      DynamoEntityType.AccountNotificationIds,
      accountId,
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
      .handleError((err, accountId) => {
        this.logger.error(
          `Failed to set account notification ids for ${accountId} with error: ${err} (${err.stack})`,
        );
      })
      .process(async (accountId) => {
        return this.setAccountNotificationIds(
          accountId,
          accountsMap[accountId],
        );
      });

    if (errors.length > 0) {
      throw new Error('Failed to set account notification ids');
    }
  }

  async setAccountNotificationIds(
    accountId: string,
    accountNotifications: PartialEntity<AccountNotificationModel>[],
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

    await this.dynamoDbService.saveItem<AccountNotificationIdsModel>(model);
  }

  private setAccountNotificationId(
    item: PartialEntity<AccountNotificationIdsModel>,
    accountNotification: PartialEntity<AccountNotificationModel>,
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
