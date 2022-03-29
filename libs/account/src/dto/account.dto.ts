import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AccountDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isEmailVerified: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPhoneVerified: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notifiId: string;
}
