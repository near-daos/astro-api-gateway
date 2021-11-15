import { ApiProperty } from '@nestjs/swagger';
import { DaoResponse } from '@sputnik-v2/dao';
import { ProposalResponse } from '@sputnik-v2/proposal';

export class SearchResultDto {
  @ApiProperty({ type: DaoResponse })
  daos: DaoResponse;

  @ApiProperty({ type: ProposalResponse })
  proposals: ProposalResponse;
}
