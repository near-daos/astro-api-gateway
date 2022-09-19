import { ApiProperty } from '@nestjs/swagger';
import { DaoPageResponse, SearchMemberResponse } from '@sputnik-v2/dao';
import { ProposalResponse } from '@sputnik-v2/proposal';

export class SearchResultDto {
  @ApiProperty({ type: DaoPageResponse })
  daos: DaoPageResponse;

  @ApiProperty({ type: ProposalResponse })
  proposals: ProposalResponse;

  @ApiProperty({ type: SearchMemberResponse })
  members: SearchMemberResponse;
}
