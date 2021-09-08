import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/dto/BaseResponse';
import { Bounty } from '../entities/bounty.entity';

export class BountyResponse extends BaseResponse<Bounty> {
  @ApiProperty({ type: [Bounty] })
  data: Bounty[];
}
