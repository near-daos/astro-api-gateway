import { BaseResponse } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../entities';

export class NotificationResponse extends BaseResponse<Notification> {
  @ApiProperty({ type: [Notification] })
  data: Notification[];
}
