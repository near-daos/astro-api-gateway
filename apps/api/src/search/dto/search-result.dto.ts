import { ApiProperty } from '@nestjs/swagger';
import { DaoResponse, SearchMemberResponse } from '@sputnik-v2/dao';
import { ProposalResponse } from '@sputnik-v2/proposal';

export class SearchResultDto {
  @ApiProperty({ type: DaoResponse })
  daos: DaoResponse;

  @ApiProperty({ type: ProposalResponse })
  proposals: ProposalResponse;

  @ApiProperty({ type: SearchMemberResponse })
  members: SearchMemberResponse;
}
