import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAccountNotificationDto {
  @ApiProperty()
  @IsBoolean()
  isMuted: boolean;

  @ApiProperty()
  @IsBoolean()
  isRead: boolean;

  @ApiProperty()
  @IsBoolean()
  isArchived: boolean;
}
