import {
  AccountNotificationSettings,
  NotificationType,
} from '@sputnik-v2/notification';
import { BaseModel } from './base.model';
import { buildEntityId } from '@sputnik-v2/utils';
import { DynamoEntityType } from '@sputnik-v2/dynamodb/types';

export class AccountNotificationSettingsModel extends BaseModel {
  accountId: string;
  settings: AccountNotificationSettingsItemModel[];
}

export class AccountNotificationSettingsItemModel {
  id: string;
  daoId: string;
  accountId: string;
  types: NotificationType[];
  mutedUntilTimestamp: string; // nanoseconds
  isAllMuted: boolean;
  enableSms: boolean;
  enableEmail: boolean;
  actionRequiredOnly: boolean;
  createdAt: number;
}

export function mapAccountNotificationSettingsModel(
  accountId: string,
  accountNotificationSettings: AccountNotificationSettings[],
): AccountNotificationSettingsModel {
  return {
    partitionId: accountId,
    entityId: buildEntityId(
      DynamoEntityType.AccountNotificationSettings,
      accountId,
    ),
    entityType: DynamoEntityType.AccountNotificationSettings,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isArchived: false,
    accountId,
    settings: accountNotificationSettings.map((setting) =>
      mapAccountNotificationSettingsToAccountNotificationSettingsItemModel(
        setting,
      ),
    ),
  };
}

export function mapAccountNotificationSettingsToAccountNotificationSettingsItemModel(
  accountNotificationSettings: AccountNotificationSettings,
): AccountNotificationSettingsItemModel {
  return {
    id: accountNotificationSettings.id,
    accountId: accountNotificationSettings.accountId,
    daoId: accountNotificationSettings.daoId,
    types: accountNotificationSettings.types,
    mutedUntilTimestamp: accountNotificationSettings.mutedUntilTimestamp,
    isAllMuted: accountNotificationSettings.isAllMuted,
    enableSms: accountNotificationSettings.enableSms,
    enableEmail: accountNotificationSettings.enableEmail,
    actionRequiredOnly: accountNotificationSettings.actionRequiredOnly,
    createdAt: accountNotificationSettings.createdAt
      ? accountNotificationSettings.createdAt.getTime()
      : undefined,
  };
}
