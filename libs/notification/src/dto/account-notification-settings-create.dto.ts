import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '@sputnik-v2/notification';

export class CreateAccountNotificationSettingsDto {
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
  @IsBoolean()
  enableSms: boolean;

  @ApiProperty()
  @IsBoolean()
  enableEmail: boolean;

  @ApiProperty()
  @IsBoolean()
  isAllMuted: boolean;
}
