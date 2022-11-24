import { ApiProperty } from '@nestjs/swagger';
import { PartialEntity } from '@sputnik-v2/dynamodb';
import { AccountModel } from '@sputnik-v2/dynamodb/models';
import { Account } from '../entities';

export class AccountResponse {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isPhoneVerified: boolean;
}

export function castAccountResponse(
  accountId: string,
  account?: Account | PartialEntity<AccountModel>,
) {
  if (!account) {
    return {
      accountId,
      email: null,
      isEmailVerified: null,
      phoneNumber: null,
      isPhoneVerified: null,
    };
  }

  return {
    accountId: account.accountId,
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    phoneNumber: account.phoneNumber,
    isPhoneVerified: account.isPhoneVerified,
  };
}
