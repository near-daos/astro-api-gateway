import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import {
  Notification,
  AccountNotificationService,
  AccountNotificationSettingsService,
  AccountNotificationSettings,
  AccountNotification,
} from '@sputnik-v2/notification';
import { SubscriptionService } from '@sputnik-v2/subscription';
import { DaoService } from '@sputnik-v2/dao';

import { castAccountNotification } from './types/account-notification';

@Injectable()
export class AccountNotifierService {
  constructor(
    private readonly accountNotificationService: AccountNotificationService,
    private readonly accountNotificationSettingsService: AccountNotificationSettingsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly daoService: DaoService,
  ) {}

  async notifyAccounts(
    notification: Notification,
  ): Promise<AccountNotification[]> {
    const daoSubscribers = await this.getDaoSubscribers(notification.daoId);
    const notificationSettings =
      await this.accountNotificationSettingsService.find({
        accountId: In(daoSubscribers),
      });
    const accountsNotifications = daoSubscribers.reduce(
      (accountsNotifications, accountId) => {
        if (
          this.shouldNotifyAccount(
            accountId,
            notification,
            notificationSettings,
          )
        ) {
          return [
            ...accountsNotifications,
            castAccountNotification(accountId, notification),
          ];
        }

        return accountsNotifications;
      },
      [],
    );
    return this.accountNotificationService.createMultiple(
      accountsNotifications,
    );
  }

  private async getDaoSubscribers(daoId: string): Promise<string[]> {
    const daoSubscribers = await this.subscriptionService.getDaoSubscribers(
      daoId,
    );
    const daoMembers = await this.daoService.getDaoMembers(daoId);
    return [...new Set(daoSubscribers.concat(daoMembers))].filter(
      (member) => !!member,
    );
  }

  private shouldNotifyAccount(
    accountId: string,
    notification: Notification,
    notificationSettings: AccountNotificationSettings[],
  ): boolean {
    const accountNotificationSettings = notificationSettings.filter(
      (ns) => ns.accountId === accountId,
    );

    // If no settings, notify by default
    if (accountNotificationSettings.length === 0) {
      return true;
    }

    return accountNotificationSettings.some(
      (ans) =>
        (!ans.daoId || ans.daoId === notification.daoId) &&
        ans.types.includes(notification.type),
    );
  }
}
