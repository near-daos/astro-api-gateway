import { ApiProperty } from '@nestjs/swagger';
import { DaoResponse } from 'src/daos/dto/dao-response.dto';
import { ProposalResponse } from 'src/proposals/dto/proposal-response.dto';

export class SearchResultDto {
  @ApiProperty({ type: DaoResponse })
  daos: DaoResponse;

  @ApiProperty({ type: ProposalResponse })
  proposals: ProposalResponse;
}
