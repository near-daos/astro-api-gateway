import { ApiProperty } from '@nestjs/swagger';

import { BaseResponseDto } from '../../common/dto/base-response.dto';

export class AccountResponseDto {}

export class AccountsResponse extends BaseResponseDto<AccountResponseDto> {
  @ApiProperty({ type: [AccountResponseDto] })
  data: AccountResponseDto[];
}
