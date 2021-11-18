import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';

import { NFTToken } from '../entities/nft-token.entity';

export class NFTTokenResponse extends BaseResponse<NFTToken> {
  @ApiProperty({ type: [NFTToken] })
  data: NFTToken[];
}
