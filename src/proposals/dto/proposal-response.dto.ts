import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/dto/BaseResponse';
import { Proposal } from '../entities/proposal.entity';

export class ProposalResponse extends BaseResponse<Proposal> {
  @ApiProperty({ type: [Proposal] })
  data: Proposal[];
}
