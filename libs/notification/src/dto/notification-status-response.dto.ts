import { ApiProperty } from '@nestjs/swagger';

export class NotificationStatusResponse {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  unreadCount: number;
}
