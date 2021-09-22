import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/dto/BaseResponse';
import { NFTToken } from '../entities/nft-token.entity';

export class NFTTokenResponse extends BaseResponse<NFTToken> {
  @ApiProperty({ type: [NFTToken] })
  data: NFTToken[];
}
