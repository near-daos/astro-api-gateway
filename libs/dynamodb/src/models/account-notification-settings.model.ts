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
  mutedUntilTimestamp: number;
  isAllMuted: boolean;
  enableSms: boolean;
  enableEmail: boolean;
  actionRequiredOnly: boolean;
  createTimestamp: number;
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
    createTimestamp: Date.now(),
    processingTimeStamp: Date.now(),
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
    createTimestamp: accountNotificationSettings.createdAt.getTime(),
  };
}
