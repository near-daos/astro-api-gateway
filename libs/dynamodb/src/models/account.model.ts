import { Account, AccountDto } from '@sputnik-v2/account';
import { buildEntityId } from '@sputnik-v2/utils';
import { DynamoEntityType } from '../types';
import { BaseModel } from './base.model';

export class AccountModel extends BaseModel {
  accountId: string;
  email?: string;
  isEmailVerified?: boolean;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  notifiUserId?: string;
  notifiAlertId?: string;
}

export function mapAccountToAccountModel(
  account: Partial<Account> | AccountDto,
): AccountModel {
  return {
    partitionId: account.accountId,
    entityId: buildEntityId(DynamoEntityType.Account, account.accountId),
    entityType: DynamoEntityType.Account,
    accountId: account.accountId,
    isArchived: !!account.isArchived,
    processingTimeStamp: Date.now(),
    createTimestamp: account.createdAt
      ? new Date(account.createdAt).getTime()
      : undefined,
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    phoneNumber: account.phoneNumber,
    isPhoneVerified: account.isPhoneVerified,
    notifiUserId: account.notifiUserId,
    notifiAlertId: account.notifiAlertId,
  };
}
