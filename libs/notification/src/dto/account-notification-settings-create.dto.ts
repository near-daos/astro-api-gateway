import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '@sputnik-v2/notification';

export class CreateAccountNotificationSettingsDto extends AccountBearer {
  @ApiProperty()
  @IsString()
  @IsOptional()
  daoId: string;

  @ApiProperty()
  @IsEnum(NotificationType, { each: true })
  types: NotificationType[];

  @ApiProperty()
  @IsString()
  mutedUntilTimestamp: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsBoolean()
  enableSms: boolean;

  @ApiProperty()
  @IsBoolean()
  isAllMuted: boolean;
}
