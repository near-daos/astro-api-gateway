import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty()
  isArchived?: boolean;

  createdAt?: Date;
}
