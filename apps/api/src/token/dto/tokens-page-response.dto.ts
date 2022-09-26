import { BaseResponseDto } from '@sputnik-v2/common';
import { TokenResponse } from '@sputnik-v2/token';
import { ApiProperty } from '@nestjs/swagger';

export class TokensPageResponseDto extends BaseResponseDto<TokenResponse> {
  @ApiProperty({ type: [TokenResponse] })
  data: TokenResponse[];
}
