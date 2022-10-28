import { Account } from '@sputnik-v2/account';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '@sputnik-v2/dynamodb';

export class AccountModel extends BaseModel {
  email?: string;
  isEmailVerified?: boolean;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  notifiUserId?: string;
  notifiAlertId?: string;
}

export function mapAccountToAccountModel(
  account: Partial<Account>,
): AccountModel {
  return {
    partitionId: account.accountId,
    entityId: `${DynamoEntityType.Account}:${account.accountId}`,
    entityType: DynamoEntityType.Account,
    isArchived: account.isArchived,
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    phoneNumber: account.phoneNumber,
    isPhoneVerified: account.isPhoneVerified,
    notifiUserId: account.notifiUserId,
    notifiAlertId: account.notifiAlertId,
  };
}
