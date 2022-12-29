import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { AccountModel } from '@sputnik-v2/dynamodb/models';
import { Account } from '../entities';

export class AccountDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  accountId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPhoneVerified?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notifiId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notifiUserId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notifiAlertId?: string;
}

export function mapAccountToAccountDto(
  account: Account | AccountModel,
): AccountDto {
  return {
    accountId: account.accountId,
    email: account.email,
    phoneNumber: account.phoneNumber,
    isEmailVerified: account.isEmailVerified,
    isPhoneVerified: account.isPhoneVerified,
    notifiUserId: account.notifiUserId,
    notifiAlertId: account.notifiAlertId,
  };
}
