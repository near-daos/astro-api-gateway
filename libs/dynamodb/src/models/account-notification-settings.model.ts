import {
  AccountNotificationSettings,
  NotificationType,
} from '@sputnik-v2/notification';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class AccountNotificationSettingsModel extends BaseModel {
  id: string;
  daoId: string;
  types: NotificationType[];
  mutedUntilTimestamp: number;
  isAllMuted: boolean;
  enableSms: boolean;
  enableEmail: boolean;
  actionRequiredOnly: boolean;
}

export function mapAccountNotificationSettingsToAccountNotificationSettingsModel(
  accountNotificationSettings: Partial<AccountNotificationSettings>,
): AccountNotificationSettingsModel {
  return {
    partitionId: accountNotificationSettings.accountId,
    entityId: `${DynamoEntityType.AccountNotificationSettings}:${accountNotificationSettings.id}`,
    entityType: DynamoEntityType.AccountNotificationSettings,
    isArchived: accountNotificationSettings.isArchived,
    id: accountNotificationSettings.id,
    daoId: accountNotificationSettings.daoId,
    types: accountNotificationSettings.types,
    mutedUntilTimestamp: accountNotificationSettings.mutedUntilTimestamp,
    isAllMuted: accountNotificationSettings.isAllMuted,
    enableSms: accountNotificationSettings.enableSms,
    enableEmail: accountNotificationSettings.enableEmail,
    actionRequiredOnly: accountNotificationSettings.actionRequiredOnly,
  };
}
