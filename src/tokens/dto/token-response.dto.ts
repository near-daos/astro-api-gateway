import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/dto/BaseResponse';
import { Token } from '../entities/token.entity';

export class TokenResponse extends BaseResponse<Token> {
  @ApiProperty({ type: [Token] })
  data: Token[];
}
