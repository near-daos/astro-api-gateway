import { AccountBearer } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAccountNotificationDto extends AccountBearer {
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
