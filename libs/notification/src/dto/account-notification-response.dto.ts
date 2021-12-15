import { BaseResponse } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { AccountNotification } from '../entities';

export class AccountNotificationResponse extends BaseResponse<AccountNotification> {
  @ApiProperty({ type: [AccountNotification] })
  data: AccountNotification[];
}
