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
import { getBlockTimestamp } from '@sputnik-v2/utils';

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
        const status = this.getNotifyAccountStatus(
          accountId,
          notification,
          notificationSettings,
        );

        if (status.shouldNotify) {
          return [
            ...accountsNotifications,
            castAccountNotification(accountId, notification, status.isDisabled),
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

  private getNotifyAccountStatus(
    accountId: string,
    notification: Notification,
    notificationSettings: AccountNotificationSettings[],
  ): { isDisabled: boolean; shouldNotify: boolean } {
    const accountNotificationSettings = notificationSettings.filter(
      (ns) =>
        ns.accountId === accountId &&
        (!ns.daoId || ns.daoId === notification.daoId),
    );

    // If no settings, notify by default
    if (accountNotificationSettings.length === 0) {
      return { isDisabled: false, shouldNotify: false };
    }

    const currentTimestamp = getBlockTimestamp();
    const isDisabled = accountNotificationSettings.some(
      (ans) =>
        (Number(ans.mutedUntilTimestamp) &&
          ans.mutedUntilTimestamp > currentTimestamp) ||
        ans.isAllMuted,
    );
    const shouldNotify = accountNotificationSettings.some((ans) =>
      ans.types.includes(notification.type),
    );

    return {
      isDisabled,
      shouldNotify,
    };
  }
}
