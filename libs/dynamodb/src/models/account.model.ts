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

export function mapAccountDtoToAccountModel(account: AccountDto): AccountModel {
  return {
    partitionId: account.accountId,
    entityId: buildEntityId(DynamoEntityType.Account, account.accountId),
    entityType: DynamoEntityType.Account,
    accountId: account.accountId,
    isArchived: false,
    createTimestamp: Date.now(),
    processingTimeStamp: Date.now(),
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    phoneNumber: account.phoneNumber,
    isPhoneVerified: account.isPhoneVerified,
    notifiUserId: account.notifiUserId,
    notifiAlertId: account.notifiAlertId,
  };
}

export function mapAccountToAccountModel(account: Account): AccountModel {
  return {
    partitionId: account.accountId,
    entityId: buildEntityId(DynamoEntityType.Account, account.accountId),
    entityType: DynamoEntityType.Account,
    accountId: account.accountId,
    isArchived: !!account.isArchived,
    createTimestamp: account.updatedAt.getTime(),
    processingTimeStamp: account.createdAt.getTime(),
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    phoneNumber: account.phoneNumber,
    isPhoneVerified: account.isPhoneVerified,
    notifiUserId: account.notifiUserId,
    notifiAlertId: account.notifiAlertId,
  };
}
