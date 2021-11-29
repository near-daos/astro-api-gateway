import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { Token } from '../entities/token.entity';

export class TokenResponse extends BaseResponse<Token> {
  @ApiProperty({ type: [Token] })
  data: Token[];
}
