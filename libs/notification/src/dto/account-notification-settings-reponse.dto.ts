import { BaseResponse } from '@sputnik-v2/common';
import { ApiProperty } from '@nestjs/swagger';
import { AccountNotificationSettings } from '../entities';

export class AccountNotificationSettingsResponse extends BaseResponse<AccountNotificationSettings> {
  @ApiProperty({ type: [AccountNotificationSettings] })
  data: AccountNotificationSettings[];
}
