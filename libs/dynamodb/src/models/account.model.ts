import { Account, AccountDto } from '@sputnik-v2/account';
import { buildEntityId } from '@sputnik-v2/utils';
import { DynamoEntityType, PartialEntity } from '../types';
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

export function mapAccountDtoToAccountModel(
  account: Partial<AccountDto>,
): PartialEntity<AccountModel> {
  return {
    partitionId: account.accountId,
    entityId: buildEntityId(DynamoEntityType.Account, account.accountId),
    entityType: DynamoEntityType.Account,
    accountId: account.accountId,
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    phoneNumber: account.phoneNumber,
    isPhoneVerified: account.isPhoneVerified,
    notifiUserId: account.notifiUserId,
    notifiAlertId: account.notifiAlertId,
  };
}

export function mapAccountToAccountModel(
  account: Partial<Account>,
): PartialEntity<AccountModel> {
  return {
    partitionId: account.accountId,
    entityId: buildEntityId(DynamoEntityType.Account, account.accountId),
    entityType: DynamoEntityType.Account,
    accountId: account.accountId,
    isArchived: !!account.isArchived,
    createdAt: account.createdAt ? account.createdAt.getTime() : undefined,
    updatedAt: account.updatedAt ? account.updatedAt.getTime() : undefined,
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    phoneNumber: account.phoneNumber,
    isPhoneVerified: account.isPhoneVerified,
    notifiUserId: account.notifiUserId,
    notifiAlertId: account.notifiAlertId,
  };
}
