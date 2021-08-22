import { ApiProperty } from '@nestjs/swagger';
import { Dao } from 'src/daos/entities/dao.entity';
import { Proposal } from 'src/proposals/entities/proposal.entity';

export class SearchResultDto {
  @ApiProperty({ type: [Dao] })
  daos: Dao[];

  @ApiProperty({ type: [Proposal] })
  proposals: Proposal[];
}
