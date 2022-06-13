import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import {
  AccountNotification,
  AccountNotificationService,
  AccountNotificationSettings,
  AccountNotificationSettingsService,
  Notification,
  NotificationService,
  NotificationStatus,
  NotificationType,
} from '@sputnik-v2/notification';
import { SubscriptionService } from '@sputnik-v2/subscription';
import { DaoService } from '@sputnik-v2/dao';
import { filterProposalDesc, getBlockTimestamp } from '@sputnik-v2/utils';
import { EventService } from '@sputnik-v2/event';
import { AccountService } from '@sputnik-v2/account';

import { castAccountNotification } from './types/account-notification';
import PromisePool from '@supercharge/promise-pool';
import {
  NotifiTemplate,
  NotifiTemplateMessageDto,
} from '@sputnik-v2/notifi-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountNotifierService {
  constructor(
    private readonly accountNotificationService: AccountNotificationService,
    private readonly accountNotificationSettingsService: AccountNotificationSettingsService,
    private readonly notificationService: NotificationService,
    private readonly subscriptionService: SubscriptionService,
    private readonly daoService: DaoService,
    private readonly eventService: EventService,
    private readonly accountService: AccountService,
    private readonly configService: ConfigService,
  ) {}

  async notifyAccounts(notification: Notification) {
    if (notification) {
      const accountNotifications = await this.createAccountNotifications(
        notification,
      );
      const template = this.getNotificationTemplate(notification);

      await this.eventService.sendNewNotificationEvent(
        notification,
        accountNotifications,
      );

      // Notify accounts via email and sms
      await PromisePool.withConcurrency(1)
        .for(accountNotifications.filter(({ isMuted }) => !isMuted))
        .process(async (accountNotification) => {
          return this.accountService.sendNotification(
            accountNotification,
            template,
          );
        });
    }
  }

  async createAccountNotifications(
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
            castAccountNotification(
              accountId,
              notification,
              status.isDisabled,
              status.isPhone,
              status.isEmail,
            ),
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
  ): {
    isDisabled: boolean;
    shouldNotify: boolean;
    isPhone: boolean;
    isEmail: boolean;
  } {
    const accountNotificationSettings = notificationSettings.filter(
      (ns) =>
        ns.accountId === accountId &&
        (!ns.daoId || ns.daoId === notification.daoId),
    );

    // If no settings, notify by default
    if (accountNotificationSettings.length === 0) {
      return {
        isDisabled: false,
        shouldNotify: true,
        isPhone: false,
        isEmail: false,
      };
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
    const isPhone = accountNotificationSettings.some((ans) => ans.enableSms);
    const isEmail = accountNotificationSettings.some((ans) => ans.enableEmail);

    return {
      isDisabled,
      shouldNotify,
      isPhone,
      isEmail,
    };
  }

  getNotificationTemplate({
    type,
    status,
    signerId,
    dao,
    daoId,
    metadata,
  }: Notification): NotifiTemplateMessageDto {
    const isDaoNotification = [
      NotificationType.CustomDao,
      NotificationType.ClubDao,
      NotificationType.FoundationDao,
      NotificationType.CorporationDao,
      NotificationType.CooperativeDao,
    ].includes(type);
    const frontendUrl = this.configService.get('frontendUrl');
    const daoName = dao?.metadata?.displayName || dao?.config?.name || daoId;

    if (isDaoNotification) {
      return {
        smsTemplate: NotifiTemplate.DaoCreated,
        emailTemplate: NotifiTemplate.DaoCreated,
        variables: {
          daoUrl: `${frontendUrl}/dao/${daoId}`,
          dao: daoName,
          signerId,
        },
      };
    }

    const description = filterProposalDesc(metadata?.proposal?.description);
    const proposerId = signerId ?? metadata?.proposal?.proposer ?? '';

    switch (status) {
      case NotificationStatus.Created:
        return {
          smsTemplate: NotifiTemplate.ProposalSubmitted,
          emailTemplate: NotifiTemplate.ProposalSubmitted,
          variables: {
            daoUrl: `${frontendUrl}/dao/${daoId}`,
            proposalUrl: `${frontendUrl}/dao/${daoId}/proposals/${metadata.proposal.id}`,
            dao: daoName,
            signerId,
            proposerId,
            description,
            type,
          },
        };
      case NotificationStatus.Rejected:
      case NotificationStatus.Approved:
      case NotificationStatus.Removed:
        return {
          smsTemplate: NotifiTemplate.ProposalAction,
          emailTemplate: NotifiTemplate.ProposalAction,
          variables: {
            daoUrl: `${frontendUrl}/dao/${daoId}`,
            proposalUrl: `${frontendUrl}/dao/${daoId}/proposals/${metadata.proposal.id}`,
            dao: daoName,
            signerId,
            proposerId,
            description,
            type,
            action: status.toLowerCase(),
          },
        };
      case NotificationStatus.VoteApprove:
      case NotificationStatus.VoteReject:
      case NotificationStatus.VoteRemove:
        return {
          smsTemplate: NotifiTemplate.Voted,
          emailTemplate: NotifiTemplate.Voted,
          variables: {
            daoUrl: `${frontendUrl}/dao/${daoId}`,
            proposalUrl: `${frontendUrl}/dao/${daoId}/proposals/${metadata.proposal.id}`,
            dao: daoName,
            signerId,
            proposerId,
            description,
            type,
            action: {
              [NotificationStatus.VoteApprove]: 'approve',
              [NotificationStatus.VoteReject]: 'reject',
              [NotificationStatus.VoteRemove]: 'remove',
            }[status],
          },
        };
      default:
        return {
          smsTemplate: NotifiTemplate.ProposalUpdated,
          emailTemplate: NotifiTemplate.ProposalUpdated,
          variables: {
            daoUrl: `${frontendUrl}/dao/${daoId}`,
            dao: daoName,
          },
        };
    }
  }
}
